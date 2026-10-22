import React, { useState } from 'react';
import {
	ArrowRight,
	Eye,
	EyeOff,
	KeyRound,
	LockKeyhole,
	ShieldCheck,
	Sparkles,
	UserRound,
} from 'lucide-react';
import { AuthUser } from '../types';
import { api } from '../services/api';

interface LoginViewProps {
	onLogin: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSubmitting(true);
		setError('');

		try {
			const usuarioLogueado = await api.auth.login(
				email.trim().toLowerCase(),
				password
			);
			onLogin(usuarioLogueado);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
			);
		} finally {
			setSubmitting(false); // <--- Esto libera el botón tanto si hay éxito como si hay error
		}
	};

	return (
		<main className="min-h-screen bg-[#f1f0e6] text-[#111112] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
			<div
				className="absolute inset-0 opacity-60 pointer-events-none"
				aria-hidden="true"
			>
				<div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-[#ebff57] blur-3xl opacity-40" />
				<div className="absolute bottom-0 -right-16 w-[380px] h-[380px] rounded-full bg-[#7bfcec] blur-3xl opacity-50" />
			</div>

			<div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.05fr_460px] gap-4 sm:gap-6">
				<section className="hidden lg:flex flex-col justify-between bg-[#111112] text-[#f1f0e6] rounded-[36px] p-10 xl:p-14 min-h-[640px] relative overflow-hidden shadow-pop">
					<div className="absolute top-8 right-8 w-16 h-16 rounded-[22px] bg-[#ebff57] flex items-center justify-center text-black">
						<Sparkles className="w-7 h-7" />
					</div>

					<div>
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs font-medium text-[#f1f0e6]/80">
							<span className="w-1.5 h-1.5 rounded-full bg-[#7bfcec]" />
							doctiva.app · Intranet académica
						</div>
						<h1 className="mt-10 text-5xl xl:text-6xl font-black leading-[0.95] tracking-tight">
							Doctiva
							<br />
							<span className="text-[#ebff57]">Learning.</span>
						</h1>
						<p className="mt-6 max-w-md text-[#f1f0e6]/70 text-sm leading-relaxed">
							Un solo acceso para administradores y usuarios: cursos
							presenciales y virtuales con todos sus recursos publicados por
							enlace.
						</p>
					</div>

					<div className="flex items-center justify-between text-[#f1f0e6]/60 text-xs">
						<span className="inline-flex items-center gap-2">
							<ShieldCheck className="w-4 h-4" /> Sesión segura y cifrada
						</span>
						<span>Presencial · Virtual</span>
					</div>
				</section>

				<section className="bg-white rounded-[36px] p-7 sm:p-9 shadow-card border border-black/5 flex flex-col justify-center min-h-[640px]">
					<div className="lg:hidden flex items-center gap-3 mb-8">
						<div className="w-11 h-11 rounded-2xl bg-[#111112] text-[#ebff57] flex items-center justify-center font-black">
							D
						</div>
						<div>
							<span className="text-[11px] tracking-widest text-mute uppercase font-medium block">
								doctiva.app
							</span>
							<h1 className="text-lg font-black tracking-tight">
								Doctiva Learning
							</h1>
						</div>
					</div>

					<div className="mb-8">
						<span className="inline-block px-3 py-1 rounded-full bg-[#ebff57]/60 text-xs font-semibold">
							Portal de acceso
						</span>
						<h2 className="mt-3 text-4xl font-black tracking-tight leading-none">
							Iniciar sesión
						</h2>
						<p className="mt-3 text-sm text-mute leading-relaxed">
							El mismo formulario reconoce si eres administrador o usuario
							académico.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-1.5">
							<label
								htmlFor="login-email"
								className="text-xs font-semibold text-mute uppercase tracking-wider"
							>
								Correo institucional
							</label>
							<div className="relative">
								<UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
								<input
									id="login-email"
									type="email"
									autoComplete="email"
									value={email}
									onChange={(event) => {
										setEmail(event.target.value);
										setError('');
									}}
									placeholder="nombre@doctiva.app"
									className="w-full pl-11 pr-4 py-3.5 bg-[#f1f0e6] text-ink rounded-2xl border border-transparent hover:border-black/10 focus:bg-white focus:border-black focus:outline-none text-sm transition"
									required
								/>
							</div>
						</div>

						<div className="space-y-1.5">
							<label
								htmlFor="login-password"
								className="text-xs font-semibold text-mute uppercase tracking-wider"
							>
								Contraseña
							</label>
							<div className="relative">
								<LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" />
								<input
									id="login-password"
									type={showPassword ? 'text' : 'password'}
									autoComplete="current-password"
									value={password}
									onChange={(event) => {
										setPassword(event.target.value);
										setError('');
									}}
									placeholder="••••••••"
									className="w-full pl-11 pr-12 py-3.5 bg-[#f1f0e6] text-ink rounded-2xl border border-transparent hover:border-black/10 focus:bg-white focus:border-black focus:outline-none text-sm transition"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword((visible) => !visible)}
									className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-black/5 cursor-pointer"
									aria-label={
										showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
									}
								>
									{showPassword ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>

						{error && (
							<div className="p-3 rounded-2xl bg-[#ebff57]/40 border border-black/10 text-xs font-medium flex items-start gap-2">
								<KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
								<span>{error}</span>
							</div>
						)}

						<button
							type="submit"
							disabled={submitting}
							className="w-full disabled:opacity-60 py-4 rounded-full bg-[#ebff57] hover:bg-[#e5f847] text-black font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 shadow-card cursor-pointer"
						>
							<span>{submitting ? 'Ingresando...' : 'Acceder al panel'}</span>
							<ArrowRight className="w-4 h-4" />
						</button>
					</form>
				</section>
			</div>
		</main>
	);
};
