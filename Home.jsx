import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Zap, Users } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant transfers", desc: "Send money between accounts in real time, backed by atomic transactions." },
  { icon: ShieldCheck, title: "OTP-verified", desc: "Every new account is confirmed by email before it can move money." },
  { icon: Users, title: "Saved payees", desc: "Keep the people and bills you pay often just a click away." },
];

const Home = () => (
  <div className="relative overflow-hidden">
    <div className="mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
      <span className="eyebrow inline-flex items-center rounded-full border border-brand-500/20 bg-brand-500/5 px-3 py-1">
        MERN Stack · Internet Banking
      </span>
      <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-ink-950 sm:text-6xl">
        Banking software,{" "}
        <span className="bg-brand-gradient bg-clip-text text-transparent">built the modern way.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-base text-ink-700">
        Open an account, move money between payees, and track every transaction in a clean,
        real-time statement.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link to="/register" className="btn-primary">
          Open an account <ArrowRight size={16} />
        </Link>
        <Link to="/login" className="btn-secondary">
          Sign in
        </Link>
      </div>
    </div>

    <div className="mx-auto grid max-w-4xl gap-4 px-6 pb-24 sm:grid-cols-3">
      {features.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="card text-left">
          <span className="icon-tile">
            <Icon size={18} strokeWidth={2.25} />
          </span>
          <p className="mt-4 font-display text-sm font-bold">{title}</p>
          <p className="mt-1.5 text-sm text-ink-700">{desc}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Home;
