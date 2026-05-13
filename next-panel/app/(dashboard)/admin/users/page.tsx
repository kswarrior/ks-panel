import { UserService } from "@/lib/services/user-service";
import { User } from "@/types";
import { Search, UserPlus, Shield, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default async function UsersOverview() {
  const users = await UserService.getUsers();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-white/60 mt-2">Manage panel users, roles, and administrative access.</p>
        </div>
        <Link
          href="/admin/users/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Create User
        </Link>
      </div>

      <div className="glass-card p-6 border-white/5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by username, email or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/40 text-sm font-medium uppercase tracking-wider">
                <th className="px-4 py-4 font-semibold">User</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold text-center">Status</th>
                <th className="px-4 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user: User) => (
                <tr key={user.userId} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/20">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {user.username}
                        {user.admin && <Shield className="w-4 h-4 text-amber-400" />}
                        </div>
                        <div className="text-white/40 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-white/80">
                    {user.admin ? (
                      <span className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded-lg border border-red-500/20">ADMINISTRATOR</span>
                    ) : (
                      <span className="bg-white/5 text-white/60 text-xs font-bold px-2 py-1 rounded-lg border border-white/10">USER</span>
                    )}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex justify-center">
                      {user.verified ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-400 text-sm font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/10">
                          <XCircle className="w-4 h-4" />
                          Pending
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <Link
                      href={`/admin/users/edit/${user.userId}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
                    >
                      Configure
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-white/40">
                      <Search className="w-12 h-12" />
                      <p>No users found in the database.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
