type AdminContext = {
  supabase: {
    rpc: (
      functionName: "has_role",
      args: { _user_id: string; _role: "admin" },
    ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
  };
  userId: string;
};

export async function assertAdmin(context: AdminContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });

  if (error) {
    console.error("Admin role check failed", error.message);
    throw new Error("অ্যাডমিন অনুমতি যাচাই করা যায়নি। আবার লগইন করুন।");
  }

  if (!data) throw new Error("এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।");
}