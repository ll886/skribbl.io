import { home } from "@/links/links"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export const loggedinRedirectHome = async (router: AppRouterInstance) => {
    await fetch(`http://localhost:3000/loggedin`).then(async (res) => {
        const json = await res.json()
        console.log(json)
        return json
    }).then((json) => {
        router.replace(home)
        return
    }).catch((err) => {
        console.error(err)
    })
}