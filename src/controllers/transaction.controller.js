const { default: mongoose } = require("mongoose");
const accountModel = require("../models/account.model");
const transactionModel = require("../models/transaction.model");
const emailService = require("../services/email.service");

/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
 * 1. Validate request
 * 2. Validate idempotency key
 * 3. Check account status
 * 4. Derive sender balance from ledger
 * 5. Create transaction (PENDING)
 * 6. Create DEBIT ledger entry
 * 7. Create CREDIT ledger entry
 * 8. Mark transaction completed
 * 9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res){

    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    /**
     * 1. VALIDATE REQUEST
     */
    if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount, idempotencyKey are required"
        });
    }

    const fromUserAccount = await accountModel.findById(fromAccount);

    const toUserAccount = await accountModel.findById(toAccount);

    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        });    
    }

    /**
     * 2. VALIDATE IDEMPOTENCY KEY
    */
    const transactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey
    })

    if(transactionAlreadyExists){
        if(transactionAlreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message: "Transaction already processed",
                transaction: transactionAlreadyExists
            });    
        }

        else if(transactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
            });    
        }

        else if(transactionAlreadyExists.status === "FAILED"){
            return res.status(500).json({
                message: "Transaction is failed",
            });    
        }

       else if(transactionAlreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message: "Transaction was reversed, please try again",
            });    
        }
    }

    /**
    * 3. CHECK ACCOUNT STATUS
    */
    
    if(fromUserAccount.status != "ACTIVE" || toUserAccount.status != "ACTIVE"){
        return res.status(400).json({
            message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
        });
    }

    
    /**
    * 4. DERIVE SENDER BALANCE FROM LEDGER
    */
   const balance = await fromUserAccount.getBalance();

   if(balance < amount){
        return res.status(400).json({
            message: `Insufficient balance, Current balance is ${balance}`
        });
   }

   let transaction;

   try{
        /**
         * 5. Create transaction (PENDING)
         * 6. Create DEBIT ledger entry
         * 7. Create CREDIT ledger entry
         * 8. Mark transaction completed
         * 9. Commit MongoDB session    
         * */
        const session = await mongoose.startSession();
        session.startTransaction();
        // session mai yah toh sb hoga yah toh kuch nhi

        transaction = (await transactionModel.create({
                fromAccount,
                toAccount,
                amount,
                idempotencyKey,
                status: "PENDING"
        }, { session }))[0];

        const debitLedgerEntry = await ledgerModel.create({
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }, { session });

        // simulation of stuck payment
        await(()=>(
            new Promise((resolve)=>setTimeout(resolve, 10000))
        ))

        const creditLedgerEntry = await ledgerModel.create({
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }, { session });

        // this caused multi document error
        // transaction.status = "COMPLETED";
        // await transaction.save({ session });
        // use this instead 

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

    } catch(err){

        return res.status(400).json({
            message: "Transaction is pending due to some issue, please retry after some time"
        });

    }

    /**
     * 10. Send email notification
    */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toUserAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction
    });
}

const createInitialFundsTransaction = async (req, res) => {

    const { toAccount, amount, idempotencyKey } = req.body;


    if(!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount, idempotencyKey are required"
        });
    }

    const toUserAccount = await accountModel.findById(toAccount);

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        });    
    }

    const fromUserAccount = await accountModel.findOne({
        systemUser: true,
        user: req.user._id
    });

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System user not found"
        });    
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    // const transaction = await transactionModel.create({
    //     fromAccount: fromUserAccount._id,
    //     toAccount: toUserAccount,
    //     amount, 
    //     idempotencyKey,
    //     status: "PENDING"
    // }, { session });

    // not created on DB directly but on server
    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount,
        amount, 
        idempotencyKey,
        status: "PENDING"
    });

    // in session, object must be inside array
    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
    }], { session });

    // in session, object must be inside array
    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
    }], { session });

    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction
    });    

}

module.exports = { createTransaction, createInitialFundsTransaction };