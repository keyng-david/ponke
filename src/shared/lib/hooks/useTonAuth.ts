// import React, {useCallback, useEffect, useRef, useState, useLayoutEffect} from 'react';
// import {useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";

export const useTonAuth = () => {
    //
}

// export const useTonAuth = () => {
//     const firstProofLoading = useRef<boolean>(true);

// 	const [data, setData] = useState({});
// 	const wallet = useTonWallet();
// 	const [authorized, setAuthorized] = useState(false);
// 	const [tonConnectUI] = useTonConnectUI();

// 	const recreateProofPayload = useCallback(async () => {
// 		if (firstProofLoading.current) {
// 			tonConnectUI.setConnectRequestParameters({ state: 'loading' });
// 			firstProofLoading.current = false;
// 		}

// 		const payload = await TonProofDemoApi.generatePayload();

// 		if (payload) {
// 			tonConnectUI.setConnectRequestParameters({ state: 'ready', value: payload });
// 		} else {
// 			tonConnectUI.setConnectRequestParameters(null);
// 		}
// 	}, [tonConnectUI, firstProofLoading])

// 	if (firstProofLoading.current) {
// 		recreateProofPayload();
// 	}

// 	useInterval(recreateProofPayload, TonProofDemoApi.refreshIntervalMs);

// 	useEffect(() =>
// 		tonConnectUI.onStatusChange(async w => {
// 			if (!w) {
// 				TonProofDemoApi.reset();
// 				setAuthorized(false);
// 				return;
// 			}

// 			if (w.connectItems?.tonProof && 'proof' in w.connectItems.tonProof) {
// 				await TonProofDemoApi.checkProof(w.connectItems.tonProof.proof, w.account);
// 			}

// 			if (!TonProofDemoApi.accessToken) {
// 				tonConnectUI.disconnect();
// 				setAuthorized(false);
// 				return;
// 			}

// 			setAuthorized(true);
//         }), 
//     [tonConnectUI]);
// }

// function useInterval(callback: () => void, delay: number | null) {
//     const savedCallback = useRef(callback)

//     useLayoutEffect(() => {
//         savedCallback.current = callback
//     }, [callback])

//     useEffect(() => {
//         if (!delay && delay !== 0) {
//             return
//         }

//         const id = setInterval(() => savedCallback.current(), delay)

//         return () => clearInterval(id)
//     }, [delay])
// }