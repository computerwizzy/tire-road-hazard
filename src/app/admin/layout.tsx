
import React from 'react';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin-layout";
import { cookies } from "next/headers";

export default async function LayoutForAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return <AdminLayout user={user}>{children}</AdminLayout>;
}
