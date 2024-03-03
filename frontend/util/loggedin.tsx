import { serverUrl } from "@/app/config"
import { home } from "@/links/links"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const loggedinRedirectHome = async (router: AppRouterInstance) => {
    await fetch(`${serverUrl}/loggedin`).then(async (res) => {
        const json = await res.json()
        return json
    }).then((json) => {
        if (json) {
            router.replace(home)
        }
    }).catch((err) => {
        console.error(err)
    })
}