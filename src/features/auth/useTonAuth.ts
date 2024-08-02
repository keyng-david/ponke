import {useCallback, useEffect, useRef} from "react";
import {useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";
import {useAccessToken} from "@/shared/model/useAccessToken";
import {useJWTToken} from "@/shared/model/jwt";

export const useTonAuth = () => {
    const firstProofLoading = useRef<boolean>(true)
    const interval = useRef<NodeJS.Timer>()
    const wallet = useTonWallet()
    const [tonConnectUI] = useTonConnectUI()

    const accessTokenStore = useAccessToken()
    const jwtTokenStore = useJWTToken()

    const recreateProofPayload = useCallback(async () => {
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
                value: data.payload,
            });
        } else {
            tonConnectUI.setConnectRequestParameters(null);
        }
    }, [tonConnectUI, firstProofLoading]);

    const initialize = useCallback(async () => {
        try {
            if (wallet) {
                if (firstProofLoading.current) {
                    recreateProofPayload()
                }

                interval.current = setInterval(recreateProofPayload, 1000)

                tonConnectUI.onStatusChange(async v => {
                    if (!v) {
                        accessTokenStore.remove()
                        jwtTokenStore.remove()
                        alert('disconnected')
                    }

                    if (v?.connectItems?.tonProof && 'proof' in v.connectItems.tonProof) {
                        const checkResponse = await fetch(
                            'https://api.toptubereviews.buzz/proof/checkProof',
                            {
                                method: 'POST',
                                body: JSON.stringify({
                                    address: v.account.address,
                                    network: v.account.chain,
                                    public_key: v.account.publicKey,
                                    proof: {
                                        ...v.connectItems.tonProof.proof,
                                        state_init: v.account.walletStateInit,
                                    }
                                })
                            }
                        )
                        const checkBody = await checkResponse.json()

                        if (checkBody) {
                            await jwtTokenStore.set(checkBody as string)
                            alert('logged in')
                        } else {
                            jwtTokenStore.remove()
                            await tonConnectUI.disconnect()
                            alert('disconnected')
                            return
                        }
                    }
                })
            } else {
                tonConnectUI.openModal().then()
            }
        } catch (e) {
            alert(e)
        }
    }, [accessTokenStore, jwtTokenStore, recreateProofPayload, tonConnectUI, wallet])

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