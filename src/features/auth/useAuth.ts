import {useJWTToken} from "@/shared/model/jwt";
import {useCallback, useRef} from "react";
import {useNavigate} from "react-router-dom";

export const useAuth = () => {
    const isInit = useRef(false)
    const navigate = useNavigate()

    const jwtTokenStore = useJWTToken()

    const initialize = useCallback(async () => {
        try {
            if (!isInit.current) {
                jwtTokenStore.remove()

                const urlParams = new URLSearchParams(window.location.search);
                const token = urlParams.get('token');

                alert(token)

                const response = await fetch(
                    'https://api.toptubereviews.buzz/game/validate',
                    {
                        headers: {
                            'Authorization': `Bearer {${token}}`,
                        },
                        method: 'POST'
                    }
                )

                alert(response.ok)
                alert(response.status)

                if (response.ok) {
                    navigate('/main')
                    isInit.current = true
                    alert('SUCCESS')
                }
            }
        } catch (e) {
            console.log(e)
            alert(e)
        }
    }, [jwtTokenStore, navigate])

    return {
        initialize,
    }
}