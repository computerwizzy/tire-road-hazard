
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLayout from "@/components/admin-layout";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";

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

  // Pass user to the layout and children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user } as { user: User });
    }
    return child;
  });

  return <AdminLayout user={user}>{childrenWithProps}</AdminLayout>;
}
