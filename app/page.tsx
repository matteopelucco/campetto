export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-green-700 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-green-700 text-sm">
              FCG
            </div>
            <span className="text-white font-bold text-xl tracking-wide">FC Grantola</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-green-100 text-sm font-medium">
            <a href="#chi-siamo" className="hover:text-white transition-colors">Chi siamo</a>
            <a href="#la-squadra" className="hover:text-white transition-colors">La squadra</a>
            <a href="#valori" className="hover:text-white transition-colors">I nostri valori</a>
            <a href="#contatti" className="hover:text-white transition-colors">Contatti</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative bg-green-700 text-white overflow-hidden"
        style={{ minHeight: "420px" }}
      >
        {/* Campo da calcio pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 42px)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 py-24 text-center">
          <div className="inline-block bg-white text-green-700 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest mb-6">
            Stagione 2025/2026
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 drop-shadow-lg">FC Grantola</h1>
          <p className="text-green-100 text-xl sm:text-2xl font-medium mb-8 max-w-xl mx-auto">
            Passione, divertimento e spirito di squadra — per i piccoli campioni di Grantola
          </p>
          <a
            href="#chi-siamo"
            className="inline-block bg-white text-green-700 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-green-50 transition-colors text-sm uppercase tracking-wider"
          >
            Scopri di più
          </a>
        </div>
        {/* Curve bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Chi siamo */}
      <section id="chi-siamo" className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-green-600 font-bold uppercase text-xs tracking-widest">Chi siamo</span>
            <h2 className="text-4xl font-black mt-2 mb-6 leading-tight">
              Il calcio che nasce dalla passione
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              FC Grantola è la squadra di calcio del nostro piccolo borgo. Nata per dare ai bambini
              e ai ragazzi del paese uno spazio in cui crescere, divertirsi e imparare i valori dello
              sport.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Allenamenti settimanali, partite tra amici e tanto entusiasmo: questo è il nostro
              campo, questo è il nostro mondo.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Bambini" value="22" icon="⚽" />
            <StatCard label="Allenatori" value="3" icon="🎽" />
            <StatCard label="Anni di attività" value="5+" icon="🏆" />
            <StatCard label="Partite giocate" value="60+" icon="📅" />
          </div>
        </div>
      </section>

      {/* La squadra */}
      <section id="la-squadra" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-green-600 font-bold uppercase text-xs tracking-widest">La squadra</span>
            <h2 className="text-4xl font-black mt-2">I nostri piccoli campioni</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Ogni bambino porta entusiasmo unico. Insieme formano qualcosa di speciale.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <TeamCard
              ruolo="Portiere"
              numero="1"
              colore="bg-yellow-400"
              descrizione="Il guardiano della porta. Riflessi rapidi e cuore grande."
            />
            <TeamCard
              ruolo="Difensori"
              numero="3–4"
              colore="bg-blue-500"
              descrizione="La linea che non si spezza. Organizzati e determinati."
            />
            <TeamCard
              ruolo="Centrocampisti"
              numero="4–5"
              colore="bg-green-500"
              descrizione="Il motore della squadra. Tecnica e visione di gioco."
            />
            <TeamCard
              ruolo="Attaccanti"
              numero="3"
              colore="bg-red-500"
              descrizione="Veloci, creativi e sempre pronti al gol."
            />
            <TeamCard
              ruolo="Mister"
              numero=""
              colore="bg-purple-500"
              descrizione="Guida la squadra con pazienza, passione e tanta voglia di insegnare."
            />
            <TeamCard
              ruolo="Staff"
              numero=""
              colore="bg-orange-400"
              descrizione="Genitori e volontari che rendono possibile tutto questo."
            />
          </div>
        </div>
      </section>

      {/* Valori */}
      <section id="valori" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <span className="text-green-600 font-bold uppercase text-xs tracking-widest">I nostri valori</span>
          <h2 className="text-4xl font-black mt-2">Cosa ci muove</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          <ValoreCard
            icon="🤝"
            titolo="Amicizia"
            testo="Prima di tutto siamo amici. Il campo è il posto dove nascono legami veri."
          />
          <ValoreCard
            icon="🎯"
            titolo="Impegno"
            testo="Ogni allenamento conta. Cresciamo migliorando ogni giorno un piccolo passo alla volta."
          />
          <ValoreCard
            icon="😄"
            titolo="Divertimento"
            testo="Lo sport deve essere gioia. Se ci si diverte, si migliora naturalmente."
          />
        </div>
      </section>

      {/* Allenamenti */}
      <section className="bg-green-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-black mb-4">📅 Allenamenti</h2>
          <p className="text-green-100 mb-8 text-lg">Vieni a trovarci al campetto!</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <AllenamentoCard giorno="Mercoledì" orario="17:00 – 18:30" />
            <AllenamentoCard giorno="Sabato" orario="10:00 – 11:30" />
          </div>
        </div>
      </section>

      {/* Contatti */}
      <section id="contatti" className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-green-600 font-bold uppercase text-xs tracking-widest">Contatti</span>
          <h2 className="text-4xl font-black mt-2">Unisciti a noi</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Vuoi iscrivere tuo figlio o saperne di più? Contattaci, siamo felici di accogliere
            nuovi giocatori!
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <ContattoCard icon="📍" label="Dove" valore="Campetto di Grantola, Varese" />
          <ContattoCard icon="📧" label="Email" valore="info@fcgrantola.it" />
          <ContattoCard icon="📱" label="Telefono" valore="+39 333 000 0000" />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-6 text-sm">
        <p>© 2026 FC Grantola · Tutti i diritti riservati · Grantola, VA</p>
      </footer>
    </div>
  );
}

// ─── Componenti interni ────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-black text-green-700">{value}</div>
      <div className="text-gray-500 text-sm font-medium mt-1">{label}</div>
    </div>
  );
}

function TeamCard({
  ruolo,
  numero,
  colore,
  descrizione,
}: {
  ruolo: string;
  numero: string;
  colore: string;
  descrizione: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${colore} rounded-full flex items-center justify-center text-white font-black text-sm`}
        >
          {numero || "★"}
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{ruolo}</h3>
      </div>
      <p className="text-gray-500 text-sm leading-relaxed">{descrizione}</p>
    </div>
  );
}

function ValoreCard({
  icon,
  titolo,
  testo,
}: {
  icon: string;
  titolo: string;
  testo: string;
}) {
  return (
    <div className="text-center p-8 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-3">{titolo}</h3>
      <p className="text-gray-500 leading-relaxed">{testo}</p>
    </div>
  );
}

function AllenamentoCard({ giorno, orario }: { giorno: string; orario: string }) {
  return (
    <div className="bg-green-600 rounded-2xl px-8 py-6 min-w-[180px]">
      <div className="font-black text-xl mb-1">{giorno}</div>
      <div className="text-green-200 text-sm">{orario}</div>
    </div>
  );
}

function ContattoCard({
  icon,
  label,
  valore,
}: {
  icon: string;
  label: string;
  valore: string;
}) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
      <div className="font-semibold text-gray-700 text-sm">{valore}</div>
    </div>
  );
}
