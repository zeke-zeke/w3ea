"use server";

import popularAddr from "../..//lib/client/popularAddr";

import {
    getContract,
    formatEther,
    parseEther,
    encodeAbiParameters,
    encodeFunctionData,
    encodePacked,
} from "viem";

import { getChainObj } from "../../lib/myChain";

import { chainClient } from "./chainWriteClient";
import { queryAccount } from "../../lib/chainQuery";

import abis from "./abi/abis";

import * as libsolana from "@/app/lib/client/solana/libsolana";
import { ChainCode, chainCodeFromString, exampleEmail } from "@/app/lib/myTypes";
import myCookies from "../myCookies";
import { isOpStackChain } from "@/app/chainsconf/chains";


function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function checkExample() {
    if (exampleEmail == myCookies.getEmail()) {
        throw new Error("You are not logged in yet, please click the button in the upper right corner to log in");
    }
}

export async function getW3eapAddr(chainCode: string) {
    if (chainCode.indexOf("SOLANA") >= 0) {
        return "";
    }
    try {
        console.log("xxxxxyyyy:", chainCode);
        const myClient = await chainClient(chainCode);
        const addr = await myClient.publicClient.readContract({
            account: myClient.account,
            address: myClient.factoryAddr,
            abi: abis.w3eaPoint,
            functionName: "w3eaPoint",
            args: [],
        });

        return "" + addr;
    } catch (e) {
        console.log("getW3eapAddr error...:", e);
        return "";
    }
}

export async function newAccount(
    chainCode: string,
    ownerId: `0x${string}`,
    passwdAddr: `0x${string}`,
    questionNos: `0x${string}`
) {
    checkExample();
    console.log(
        `newAccount called ... ownerId= ${ownerId}, passwdAddr=${passwdAddr}`
    );
    const myClient = await chainClient(chainCode);
    let freeFeeAmount = 0;
    if (ownerId.endsWith("0000")) {
        freeFeeAmount = myClient.freeFeeWhen1stCreated;
    }
    let hash = null;
    var newAccountData;
    try {
        newAccountData = encodeFunctionData({
            abi: abis.newAccount,
            functionName: "newAccount",
            args: [ownerId, passwdAddr, questionNos, freeFeeAmount],
        });

        hash = await myClient.walletClient.sendTransaction({
            account: myClient.account,
            to: myClient.factoryAddr,
            value: BigInt(0), // parseEther("0.0"),
            data: newAccountData,
        });

        console.log(`newAccount, hash=${hash}`);

        let acct = { accountAddr: null, created: false };
        for (let kk = 0; kk < 600; kk++) {
            console.log("queryAccount...888");
            acct = await queryAccount(
                myClient.chainCode,
                myClient.factoryAddr,
                ownerId
            );
            if (acct?.created == false) {
                console.log("waiting for creating new account...", kk);
                await sleep(1000);
            } else {
                console.log("created new account:", acct);
                return {
                    success: true,
                    accountId: acct.accountAddr,
                    hash: hash,
                };
            }
        }

        return { success: false, accountId: "timeOut", hash: hash };
    } catch (e) {
        console.log("newAccount error:", e);
        return { success: false, accountId: "error", hash: hash };
    }
}

async function getL1DataFee(cc: any, data: any) {
    if (cc.l1GasPriceOracleContract.length < 42) {
        return BigInt(0);
    }

    const myAbi = abis.getL1DataFee;
    myAbi[0].name = cc.l1DataFeeFunc;
    console.log("getL1DataFee:", myAbi, data, cc.publicClient.readContract);
    console.log("getL1DataFee:cc:", cc);
    const l1DataFee = await cc.publicClient.readContract({
        account: cc.account,
        address: cc.l1GasPriceOracleContract,
        abi: myAbi,
        functionName: cc.l1DataFeeFunc,
        args: [data],
    });
    console.log("getL1DataFee22:", l1DataFee);
    return BigInt((l1DataFee * BigInt(105)) / BigInt(100));
}

export async function newAccountAndTransferETH(
    chainCode: string,
    ownerId: `0x${string}`,
    passwdAddr: `0x${string}`,
    questionNos: `0x${string}`,
    to: `0x${string}`,
    amount: BigInt,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string
) {
    checkExample();
    if (chainCode.indexOf("SOL") >= 0) {
        console.log(
            "solana called on client side, this time. here can't be reach!"
        );
    }
    detectEstimatedFee = BigInt(detectEstimatedFee);
    l1DataFee = BigInt(l1DataFee);
    if (preparedMaxFeePerGas != undefined) {
        preparedMaxFeePerGas = BigInt(preparedMaxFeePerGas);
    }
    if (preparedGasPrice != undefined) {
        preparedGasPrice = BigInt(preparedGasPrice);
    }
    if (!ownerId.startsWith("0x")) {
        ownerId = `0x${ownerId}`;
    }
    console.log(
        `newAccountAndTransferETH called ..onlyQueryFee=${onlyQueryFee}. ownerId= ${ownerId}, passwdAddr=${passwdAddr},detectEstimatedFee=${detectEstimatedFee}`
    );
    const costFee = BigInt(detectEstimatedFee) + BigInt(l1DataFee);
    console.log(
        "newAccountAndTransferETH called, costFee:",
        costFee,
        ", data:",
        data,
        "bridgeDirection=", bridgeDirection, "chainCode=", chainCode
    );

    let myClient;
    if (bridgeDirection == "L1ToL2") {
        console.log("bbb--x-111,", getChainObj(chainCode).l1ChainCode);
        myClient = await chainClient(getChainObj(chainCode).l1ChainCode);
    } else {
        console.log("bbb--x-222,", chainCode);
        myClient = await chainClient(chainCode);
    }

    let freeFeeAmount = 0;
    if (ownerId.endsWith("0000")) {
        freeFeeAmount = myClient.freeFeeWhen1stCreated;
    }
    let hash = "";
    let newAccountData;
    let request = null;

    try {
        newAccountData = encodeFunctionData({
            abi: abis.newAccountAndSendTrans,
            functionName: "newAccountAndSendTrans",
            args: [
                ownerId,
                passwdAddr,
                questionNos,
                freeFeeAmount,
                to,
                amount,
                data,
                costFee, // L2fee+L1fee  on client side.
                signature,
            ],
        });

        console.log(
            "total fee = txFee+L1DataFee =",
            detectEstimatedFee,
            "+",
            l1DataFee
        );

        console.log(
            "xxx:account,factory:",
            myClient.account.address,
            myClient.factoryAddr,
            "data:"
            // newAccountData
        );
        console.log("xxxxxxx---1aa,");
        // estimate transaction fee.
        if (onlyQueryFee) {
            console.log("xxxxxxx---2aa,");
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
                // gas: chainCode.indexOf("MANTLE") >= 0 ? BigInt(2000000000) : undefined
            });
            console.log("xxxxxxx---2aaBB,");
            // console.log("xxxxxxx---3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req:", request);
                throw Error("unsupport prepare req!");
            }

            console.log(
                `xxxxx-4,newAccountAndTransferETH detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "xxxxx-5,newAccountAndTransferETH detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );

            console.log("xxxxxxx---2a,chainCode:", chainCode);
            let _l1DataFee = BigInt(0);
            // test,临时跳过 ChainCode.UNICHAIN_TEST_CHAIN
            if (isOpStackChain(chainCodeFromString(chainCode))) {
                console.log("L1 data fee of OPSTACK:1:", _l1DataFee);
                _l1DataFee = await myClient.walletClient.estimateL1Fee({
                    account: myClient.account,
                    to: myClient.factoryAddr,
                    value: BigInt(0), // parseEther("0.0"),
                    data: newAccountData,
                })
                console.log("L1 data fee of OPSTACK:2:", _l1DataFee);
            } else {
                _l1DataFee = await getL1DataFee(
                    myClient,
                    encodePacked(
                        // from,to,value,data,nonce,gasPrice,gasLimit
                        [
                            "address",
                            "address",
                            "uint256",
                            "bytes",
                            "uint256",
                            "uint256",
                            "uint256",
                        ],
                        [
                            myClient.account?.address,
                            myClient.factoryAddr,
                            BigInt(0),
                            newAccountData,
                            BigInt(999999),
                            BigInt(999999999),
                            BigInt(99999),
                        ]
                    )
                );
            }


            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: _l1DataFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: myClient.factoryAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: newAccountData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log("sendTransaction with new Account:", hash);
            return { success: true, tx: hash, msg: "" };
        }
        // xxxx
    } catch (e) {

        console.log("if[exceeds the balance], check my [EOA ****Acce55] first!");
        console.log("newAccount error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

export async function createTransaction(
    chainCode: string,
    ownerId: `0x${string}`,
    accountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    data: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    l1DataFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint,
    bridgeDirection: string,
    upgradeImpl: boolean, // 发送交易的同时升级“合约实现”
) {
    checkExample();
    detectEstimatedFee = BigInt(detectEstimatedFee);
    l1DataFee = BigInt(l1DataFee);
    if (preparedMaxFeePerGas != undefined) {
        preparedMaxFeePerGas = BigInt(preparedMaxFeePerGas);
    }
    if (preparedGasPrice != undefined) {
        preparedGasPrice = BigInt(preparedGasPrice);
    }
    console.log(
        `createTransaction called ... ownerId= ${ownerId},accountAddr=${accountAddr}, amount=${amount},onlyQueryFee=${onlyQueryFee},detectEstimatedFee=${detectEstimatedFee},bridgeDirection=${bridgeDirection},l1DataFee=${l1DataFee},preparedMaxFeePerGas=${preparedMaxFeePerGas},preparedGasPrice=${preparedGasPrice},`
    );
    const costFee = BigInt(detectEstimatedFee) + BigInt(l1DataFee);
    console.log("createTransaction called, CostFee:", costFee, ", data:", data);
    let dataSendToAccount = null;
    let request = null;
    let hash = "";
    let myClient;
    if (bridgeDirection == "L1ToL2") {
        console.log("L1ToL2,here.");
        myClient = await chainClient(getChainObj(chainCode).l1ChainCode);
    } else {
        console.log("L1ToL2,not here.");
        myClient = await chainClient(chainCode);
    }
    console.log("serverside,createTransaction,upgradeImpl=", upgradeImpl);
    try {
        if (upgradeImpl) {
            // upImplAfterSend
            dataSendToAccount = encodeFunctionData({
                abi: abis.upImplAfterSend,
                functionName: "upImplAfterSend",
                args: [to, BigInt(amount), data, costFee, passwdAddr, signature],
            });
        } else {
            dataSendToAccount = encodeFunctionData({
                abi: abis.sendTransaction,
                functionName: "sendTransaction",
                args: [to, BigInt(amount), data, costFee, passwdAddr, signature],
            });
        }


        console.log(
            "22 total fee = txFee+L1DataFee =",
            detectEstimatedFee,
            "+",
            l1DataFee,
            "==>",
            costFee
        );

        // console.log("dataSendToAccount:", dataSendToAccount);

        if (onlyQueryFee) {
            console.log(
                `createTransaction detected2. detectEstimatedFee=,realEstimatedFee, maxFeePerGas,gasPrice 222`
            );
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
            });

            console.log("createTransaction detected2.3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req2:", request);
                throw Error("unsupport prepare req2!");
            }

            console.log(
                `createTransaction detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "createTransaction detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );
            let _l1DataFee = BigInt(0);
            if (chainCode == ChainCode.OPTIMISM_MAIN_CHAIN ||
                chainCode == ChainCode.OPTIMISM_TEST_CHAIN ||
                chainCode == ChainCode.UNICHAIN_MAIN_CHAIN ||
                chainCode == ChainCode.UNICHAIN_TEST_CHAIN) {
                _l1DataFee = await myClient.walletClient.estimateL1Fee({
                    account: myClient.account,
                    to: accountAddr,
                    value: BigInt(0), // parseEther("0.0"),
                    data: dataSendToAccount,
                })
                console.log("L1 data fee of OPSTACK:", _l1DataFee);
            } else {
                _l1DataFee = await getL1DataFee(
                    myClient,
                    encodePacked(
                        // from,to,value,data,nonce,gasPrice,gasLimit
                        [
                            "address",
                            "address",
                            "uint256",
                            "bytes",
                            "uint256",
                            "uint256",
                            "uint256",
                        ],
                        [
                            myClient.account?.address,
                            accountAddr,
                            BigInt(0),
                            dataSendToAccount,
                            BigInt(999999),
                            BigInt(999999999),
                            BigInt(99999),
                        ]
                    )
                );
            }



            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                l1DataFee: _l1DataFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            console.log(
                "create transaction, before prepareTransactionRequest.preparedMaxFeePerGas:",
                preparedMaxFeePerGas
            );
            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log(
                "create transaction, after prepareTransactionRequest,request!:",
                request
            );
            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: accountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: dataSendToAccount,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            // const serializedTransaction =
            //     await myClient.walletClient.signTransaction(request);
            // hash = await myClient.walletClient.sendRawTransaction({
            //     serializedTransaction,
            // });

            console.log("createTransaction success a:", hash);
            return { success: true, tx: hash, msg: "" };
        }
    } catch (e) {
        console.log("createTransaction error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

export async function changePasswdAddr(
    chainCode: string,
    bigBrotherOwnerId: `0x${string}`,
    bigBrotherAccountAddr: `0x${string}`,
    passwdAddr: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: `0x${string}`,
    signature: `0x${string}`,
    onlyQueryFee: boolean,
    detectEstimatedFee: bigint,
    preparedMaxFeePerGas: bigint,
    preparedGasPrice: bigint
) {
    checkExample();
    detectEstimatedFee = BigInt(detectEstimatedFee);
    if (preparedMaxFeePerGas != undefined) {
        preparedMaxFeePerGas = BigInt(preparedMaxFeePerGas);
    }
    if (preparedGasPrice != undefined) {
        preparedGasPrice = BigInt(preparedGasPrice);
    }
    console.log(
        `changePaswdAddr called ... bigBrotherOwnerId= ${bigBrotherOwnerId},bigBrotherAccountAddr=${bigBrotherAccountAddr}, newPasswdAddr=${newPasswdAddr},newQuestionNos=${newQuestionNos},detectEstimatedFee=${detectEstimatedFee},onlyQueryFee=${onlyQueryFee}`
    );
    let chgPasswdData = null;
    let request = null;
    let hash = "";
    const myClient = await chainClient(chainCode);
    try {
        chgPasswdData = encodeFunctionData({
            abi: abis.chgPasswdAddr,
            functionName: "chgPasswdAddr",
            args: [
                newPasswdAddr,
                newQuestionNos,
                BigInt(detectEstimatedFee),
                passwdAddr,
                signature,
            ],
        });

        if (onlyQueryFee) {
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
            });

            // console.log("xxxxxxx---3:", request);
            let realEstimatedFee = BigInt(0);
            if (request.maxFeePerGas != undefined) {
                //eip-1559
                console.log("xxxxxxx-chgpasswd---3-1:", request.maxFeePerGas);
                realEstimatedFee = request.gas * request.maxFeePerGas;
            } else if (request.gasPrice != undefined) {
                // Legacy
                console.log("xxxxxxx-chgpasswd---3-2:", request.gasPrice);
                realEstimatedFee = request.gas * request.gasPrice;
            } else {
                console.log("unsupport prepare req2XX:", request);
                throw Error("unsupport prepare req2XX!");
            }

            console.log(
                `changePaswdAddr detected. detectEstimatedFee=${detectEstimatedFee},realEstimatedFee=${realEstimatedFee},req.gas=${request.gas}, maxFeePerGas=${request.maxFeePerGas},gasPrice=${request.gasPrice}`
            );

            console.log(
                "changePaswdAddr detected by prepareTransactionRequest result:",
                {
                    realEstimatedFee: realEstimatedFee,
                    request: request,
                }
            );

            return {
                success: true,
                msg: "",
                realEstimatedFee: realEstimatedFee,
                maxFeePerGas: request.maxFeePerGas, //eip-1559
                gasPrice: request.gasPrice, // Legacy
                gasCount: request.gas,
                tx: "",
            };
        } else {
            // specified maxFeePerGas to send Transaction....
            if (
                (preparedMaxFeePerGas == undefined ||
                    preparedMaxFeePerGas == BigInt(0)) &&
                (preparedGasPrice == undefined || preparedGasPrice == BigInt(0))
            ) {
                // throw new Error("maxFeePerGas error!");
                return { success: false, msg: "maxFeePerGas error!", tx: "" };
            }

            // simulate again
            request = await myClient.walletClient.prepareTransactionRequest({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });

            hash = await myClient.walletClient.sendTransaction({
                account: myClient.account,
                to: bigBrotherAccountAddr,
                value: BigInt(0), // parseEther("0.0"),
                data: chgPasswdData,
                maxFeePerGas: preparedMaxFeePerGas, //eip-1559
                gasPrice: preparedGasPrice, // Legacy
            });
            console.log("chgPasswdAddr success:", hash);
            return { success: true, tx: hash, msg: "" };
        }
    } catch (e) {
        console.log("chgPasswdAddr error:", e);
        return { success: false, msg: e.shortMessage, tx: hash };
    }
}

//////////////////

//////////////////

/////////////////  **************************

///////////////

export async function transferETHXXXXX(
    ownerId: `0x${string}`,
    to: `0x${string}`,
    amount: bigint,
    passwdAddr: `0x${string}`,
    nonce: bigint,
    signature: `0x${string}`
) {
    checkExample();
    console.log(`transferETH called ... ownerId= ${ownerId}, amount=${amount}`);
    var callAccountData;

    try {
        callAccountData = encodeFunctionData({
            abi: abis.transferETH,
            functionName: "transferETH",
            args: [to, amount, passwdAddr, nonce, signature],
        });

        console.log("transferETH , _execute");
        const hash = await _execute(ownerId, callAccountData);

        console.log(`transferETH finished, transHash=${hash}`);
        return hash;
    } catch (e) {
        console.log("transferETH error:passwdAddr=" + passwdAddr + ":", e);
        return popularAddr.ZERO_ADDRError;
    }
}

export async function chgPasswdAddrXXXX(
    ownerId: `0x${string}`,
    newPasswdAddr: `0x${string}`,
    newQuestionNos: string,
    passwdAddr: `0x${string}`,
    nonce: bigint,
    signature: `0x${string}`
) {
    checkExample();
    console.log(
        `chgPasswdAddr called ... ownerId= ${ownerId}, newPasswdAddr=${newPasswdAddr}`
    );
    var callAccountData;

    try {
        callAccountData = encodeFunctionData({
            abi: abis.chgPasswdAddr,
            functionName: "chgPasswdAddr",
            args: [newPasswdAddr, newQuestionNos, passwdAddr, nonce, signature],
        });

        console.log("chgPasswdAddr , _execute");
        const hash = await _execute(ownerId, callAccountData);

        console.log(`chgPasswdAddr finished, transHash=${hash}`);
        return hash;
    } catch (e) {
        console.log("chgPasswdAddr error:passwdAddr=" + passwdAddr + ":", e);
        return popularAddr.ZERO_ADDRError;
    }
}

async function _execute(
    chainCode: string,
    ownerId: `0x${string}`,
    callAccountData: `0x${string}`
) {
    checkExample();
    console.log(
        `_execute ownerId=${ownerId}, callAccountData= ${callAccountData}`
    );
    var callAdminData = encodeFunctionData({
        abi: abis.execute,
        functionName: "execute",
        args: [ownerId, callAccountData, BigInt(10)],
    });

    console.log(`_execute callAdminData= ${callAdminData}`);

    const eGas = (await chainClient(chainCode)).publicClient.estimateGas({
        account: (await chainClient(chainCode)).account,
        to: (await chainClient(chainCode)).factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });

    // estimate transaction fee.
    const request = (
        await chainClient(chainCode)
    ).walletClient.prepareTransactionRequest({
        account: (await chainClient(chainCode)).account,
        to: (await chainClient(chainCode)).factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });

    const preGasFee = request.gas * request.maxFeePerGas;
    console.log("+++++preGasFee:", preGasFee, eGas, request.gas);

    callAdminData = encodeFunctionData({
        abi: abis.execute,
        functionName: "execute",
        args: [ownerId, callAccountData, preGasFee],
    });

    const hash = (await chainClient(chainCode)).walletClient.sendTransaction({
        account: (await chainClient(chainCode)).account,
        to: (await chainClient(chainCode)).factoryAddr,
        value: BigInt(0), // parseEther("0.0"),
        data: callAdminData,
    });
    console.log(`_execute hash=${hash}`);
    return hash;
}
