import React, { useState } from 'react';
import { Mail, MapPin, Send, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name.trim()) tempErrors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
      tempErrors.email = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = 'El correo electrónico no es válido.';
    }
    if (!formData.subject.trim()) tempErrors.subject = 'El asunto es obligatorio.';
    if (!formData.message.trim()) tempErrors.message = 'El mensaje no puede estar vacío.';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    
    // Simulate API request safely
    setTimeout(() => {
      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1200);
  };

  return (
    <section id="contacto" className="py-24 relative overflow-hidden bg-[#0A0D17]/50">
      {/* Background Ambient Spheres */}
      <div className="absolute bottom-[10%] left-[10%] w-[35vw] h-[35vw] glow-purple opacity-30 blur-[130px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Head */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-accent-cyan mb-3">
            Hablemos hoy
          </h2>
          <p className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            ¿Tienes un Proyecto en Mente?
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-primary-500 to-accent-cyan mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
          {/* Contact Details Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left h-full">
            <div>
              <h3 className="font-display font-bold text-2xl text-white mb-4">
                ¡Ponte en contacto!
              </h3>
              <p className="text-gray-400 leading-relaxed mb-10">
                ¿Buscas integrar un desarrollador dedicado a tu equipo, o necesitas estructurar un proyecto digital completo desde cero? Escríbeme y analicemos cómo materializar tu idea con la mejor calidad.
              </p>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-cyan">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Correo Electrónico</h4>
                    <a href="mailto:jorgech777@icloud.com" className="text-sm font-semibold text-white hover:text-accent-cyan transition-colors">
                      jorgech777@icloud.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary-500">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ubicación</h4>
                    <p className="text-sm font-semibold text-white">Iztapalapa, Ciudad de México</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Chat Directo</h4>
                    <span className="text-sm font-semibold text-white">Disponible vía LinkedIn o GitHub</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="lg:col-span-7 w-full">
            <div className="glass-card rounded-3xl p-8 shadow-2xl border-white/10 relative">
              
              {status === 'success' ? (
                /* Success Notification Modal inside container (No alert() blocks!) */
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-6 animate-bounce" />
                  <h4 className="font-display font-extrabold text-2xl text-white mb-2">¡Mensaje Enviado!</h4>
                  <p className="text-gray-400 text-sm max-w-sm mb-6">
                    Gracias por ponerte en contacto. Responderé a tu correo electrónico a la brevedad posible.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold text-xs tracking-wider transition-all"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="name" className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Nombre Completo</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez"
                        className={`w-full px-4 py-3 rounded-xl bg-[#090D17]/85 border text-sm text-white placeholder-gray-600 transition-all input-glow ${
                          errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                        }`}
                        required
                      />
                      {errors.name && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.name}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="email" className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Correo Electrónico</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ej. juan@correo.com"
                        className={`w-full px-4 py-3 rounded-xl bg-[#090D17]/85 border text-sm text-white placeholder-gray-600 transition-all input-glow ${
                          errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                        }`}
                        required
                      />
                      {errors.email && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="subject" className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Asunto</label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Ej. Propuesta de Proyecto / Vacante Fullstack"
                      className={`w-full px-4 py-3 rounded-xl bg-[#090D17]/85 border text-sm text-white placeholder-gray-600 transition-all input-glow ${
                        errors.subject ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                      }`}
                      required
                    />
                    {errors.subject && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.subject}
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="message" className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Mensaje</label>
                    <textarea
                      name="message"
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe los detalles generales de tu proyecto..."
                      className={`w-full px-4 py-3 rounded-xl bg-[#090D17]/85 border text-sm text-white placeholder-gray-600 transition-all input-glow ${
                        errors.message ? 'border-red-500/50 focus:border-red-500' : 'border-white/10'
                      }`}
                      required
                    ></textarea>
                    {errors.message && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full flex items-center justify-center gap-2 mt-2 py-4 rounded-xl font-bold text-xs tracking-wider uppercase text-white bg-gradient-to-r from-primary-600 to-accent-indigo hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-650/25"
                    id="contact-submit-btn"
                  >
                    {status === 'submitting' ? 'Enviando...' : 'Enviar Mensaje'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
