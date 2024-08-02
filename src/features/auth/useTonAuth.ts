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

    const createProofPayload = useCallback(async () => {
        try {
            if (firstProofLoading.current) {
                tonConnectUI.setConnectRequestParameters({ state: "loading" });
                firstProofLoading.current = false;
            }

            const response = await fetch(
                '/proof/generatePayload',
                {
                    method: 'GET',
                    mode: 'cors',
                }
            )
            const data = await response.json()
            alert(`createProofPayload ${response}`)
            alert(`createProofPayload ${data}`)

            // if (data.payload) {
            //     tonConnectUI.setConnectRequestParameters({
            //         state: "ready",
            //         value: data.payload,
            //     });
            // } else {
            //     tonConnectUI.setConnectRequestParameters(null);
            // }
        } catch (e) {
            alert(`createProofPayload ${e}`)
        }
    }, [tonConnectUI, firstProofLoading]);

    const updateStatusListener = useCallback(() => {
        tonConnectUI.onStatusChange(async v => {
            if (!v) {
                accessTokenStore.remove()
                jwtTokenStore.remove()
                alert('disconnected')
            }

            if (v?.connectItems?.tonProof && 'proof' in v.connectItems.tonProof) {
                alert('updateStatusListener')
                const checkResponse = await fetch(
                    '/proof/checkProof',
                    {
                        method: 'POST',
                        mode: 'cors',
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
                alert(`check body ${checkBody}`)

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
    }, [accessTokenStore, jwtTokenStore, tonConnectUI])

    interval.current = setInterval(createProofPayload, 10000)

    const initialize = useCallback(async () => {
        try {
            alert('initialize')
            if (firstProofLoading.current) {
                await createProofPayload()
            }
            updateStatusListener()
            if (!wallet) {
                tonConnectUI.openModal().then()
            }
        } catch (e) {
            alert(e)
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