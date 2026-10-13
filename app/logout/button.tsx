import { logout } from "./actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button className="text-sm font-medium text-slate-500 hover:text-rose-600">Sign out</button>
    </form>
  );
}
