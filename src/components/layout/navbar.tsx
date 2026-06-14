import type { UserRole } from "@/types/domain";

type Props = {
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
};

export default function Navbar({
  name,
  email,
  role,
  image,
}: Props) {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          MeetFlow workspace
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Plan clearly. Meet confidently.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-10 w-10 rounded-xl object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">
            {email} · <span className="capitalize">{role}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
