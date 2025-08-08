
import { redirect } from "next/navigation";

export default async function Home() {
    // The middleware now handles all authentication checks and redirects.
    // Any user reaching this page is authenticated, so we can safely redirect
    // them to the main administrative dashboard.
    redirect('/admin');

    return null; 
}
