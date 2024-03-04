import { serverUrl } from "@/app/config"
import { home } from "@/links/links"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const loggedinRedirectHome = async (router: AppRouterInstance) => {
    const json = await fetch(`${serverUrl}/loggedin`, {
        credentials: 'include'
    }).then(async (res) => {
        return res.json()
    }).catch((err) => {
        console.error(err)
    })

    if (json) {
        router.push(home)
    }
}