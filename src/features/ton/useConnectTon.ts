import {useCallback, useEffect, useRef} from "react";
import {Account, TonProofItemReplySuccess, useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import {useAccessToken} from "@/shared/model/useAccessToken";
import {useJWTToken} from "@/shared/model/jwt";

// TODO: remove jwt saving

export const useConnectTon = () => {
    const firstProofLoading = useRef<boolean>(true)
    const interval = useRef<NodeJS.Timer>()
    const wallet = useTonWallet()
    const [tonConnectUI] = useTonConnectUI()

    const accessTokenStore = useAccessToken()
    const jwtTokenStore = useJWTToken()

    const createProofPayload = useCallback(async () => {
        try {
            if (firstProofLoading.current) {
                tonConnectUI.setConnectRequestParameters({ state: "loading" });
                firstProofLoading.current = false;
            }

            const response = await fetch(
                'https://api.toptubereviews.buzz/proof/generatePayload',
                {
                    method: 'GET',
                }
            )

            const data = await response.json()

            if (data.payload) {
                tonConnectUI.setConnectRequestParameters({
                    state: "ready",
                    value: {
                        tonProof: data.payload,
                    },
                });
            } else {
                tonConnectUI.setConnectRequestParameters(null);
            }
        } catch (e) {
            console.log(e)
        }
    }, [tonConnectUI, firstProofLoading]);

    async function checkProof(
        proof: TonProofItemReplySuccess["proof"],
        account: Account
    ) {
        try {
            const checkResponse = await fetch(
                'https://api.toptubereviews.buzz/proof/checkProof',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        address: account.address,
                        network: account.chain,
                        publicKey: account.publicKey,
                        proof: {
                            ...proof,
                            stateInit: account.walletStateInit,
                        }
                    })
                }
            )
            const checkBody = await checkResponse.json()

            if (checkResponse.ok && checkBody) {
                await jwtTokenStore.set(checkBody.jwt as string)
            } else {
                jwtTokenStore.remove()
                await tonConnectUI.disconnect()
                return
            }
        } catch (e) {
            console.log(`${e}`)
        }
    }

    const updateStatusListener = useCallback(() => {
        tonConnectUI.onStatusChange(async v => {
            if (!v) {
                accessTokenStore.remove()
                jwtTokenStore.remove()
            }

            if (v?.connectItems?.tonProof && 'proof' in v.connectItems.tonProof) {
                await checkProof(v.connectItems.tonProof.proof, v.account)
            }
        })
    }, [accessTokenStore, jwtTokenStore, tonConnectUI])

    interval.current = setInterval(createProofPayload, 100000)

    const initialize = useCallback(async () => {
        try {
            // if (wallet) {
            //     await tonConnectUI.disconnect()
            // }
            if (firstProofLoading.current) {
                await createProofPayload()
            }
            updateStatusListener()
            if (!wallet) {
                tonConnectUI.openModal().then()
            }
        } catch (e) {
            console.log(e)
        }
    }, [tonConnectUI, wallet])

    useEffect(() => {
        if (wallet && firstProofLoading.current) {
            initialize().then()
        }
    }, [wallet, initialize]);

    useEffect(() => {
        return () => clearInterval(interval.current)
    }, []);

    return {
        initialize,
    }
}