import { BookOpen, Target, Compass, Shield, Users, Award, Eye } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-md">
            Who We Are
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-black text-gray-900 dark:text-white mt-4 mb-6 leading-tight">
            Malawiana Digital Media
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed font-light">
            Founded in 2026, Malawiana is Malawi's premier independent digital news platform. We are dedicated to providing credible, professional, and timely journalism to keep citizens, decision-makers, and the global Malawian diaspora accurately informed.
          </p>
        </div>

        {/* Brand Story */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 mb-12">
          <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-4">Our Journalism</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed mb-6">
            In an era of rapid information and digital noise, truth and credibility have never been more critical. At Malawiana, we move beyond the headlines to investigate, verify, and explain. From investigative political reporting and deep business insights to national developmental updates in agriculture, technology, education, and sports, our reporters cover Malawi with precision and depth.
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed">
            We are strictly non-partisan, independent of political influence, and bound by a rigid code of journalistic ethics. Our editorial desk ensures that all stories are thoroughly fact-checked and contextually complete before publication.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {/* Mission */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 shrink-0">
                <Target size={24} />
              </div>
              <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-3">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
                To foster a well-informed Malawian society through professional, investigative, and ethical digital journalism, giving voice to the voiceless and holding public, private, and social institutions accountable.
              </p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shrink-0">
                <Eye size={24} />
              </div>
              <h2 className="text-xl font-bold font-serif text-gray-900 dark:text-white mb-3">Our Vision</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed font-light">
                To be the most trusted, innovative, and impactful digital news portal in Malawi, recognized globally as the gold standard for Malawian investigative reports, developmental news, and public interest journalism.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 mb-12">
          <h2 className="text-2xl font-serif font-black text-gray-900 dark:text-white mb-8 text-center">Our Core Values</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Value 1 */}
            <div className="text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto sm:mx-0">
                <Shield size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Integrity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We maintain the highest standards of fairness, honesty, and truth. If we make a mistake, we correct it swiftly and transparently.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 mx-auto sm:mx-0">
                <Compass size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Independence</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We are beholden to no special interests, political factions, or commercial empires. Our only loyalty is to the truth.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-950/30 flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4 mx-auto sm:mx-0">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Public Interest</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Our journalism prioritizes issues that impact daily lives: accountability, democracy, environment, health, and national development.
              </p>
            </div>

            {/* Value 4 */}
            <div className="text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 mx-auto sm:mx-0">
                <Award size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">Excellence</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                We strive for premium writing, compelling visuals, innovative digital presentation, and an exceptional user experience.
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Standards */}
        <div className="border-t border-gray-200 dark:border-slate-800 pt-8 text-center text-gray-500 dark:text-gray-400 text-xs">
          <p className="max-w-2xl mx-auto leading-relaxed">
            Malawiana.com is a registered trademark of Malawiana Digital Media Ltd. Licensed by the Malawi Communications Regulatory Authority (MACRA) for digital broadcasting. All editorial content is subject to the guidelines of the Media Council of Malawi.
          </p>
        </div>
      </div>
    </div>
  )
}
