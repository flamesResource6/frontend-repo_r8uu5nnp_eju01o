import React, { useEffect, useState } from 'react'
import { api } from './lib/api'
import { Menu, Users, CreditCard, CalendarDays, Settings, Shield, LayoutDashboard, LogOut, BadgeCheck, Coins, ChevronRight } from 'lucide-react'

function StatCard({ title, value, icon: Icon, accent = 'green' }) {
  const accents = {
    green: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400',
    yellow: 'from-yellow-500/20 to-yellow-500/0 text-yellow-400',
    red: 'from-red-500/20 to-red-500/0 text-red-400',
    blue: 'from-blue-500/20 to-blue-500/0 text-blue-400',
  }
  return (
    <div className="relative rounded-xl bg-slate-900/70 border border-slate-800 p-5 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${accents[accent]} pointer-events-none`}></div>
      <div className="relative flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-slate-300 text-sm">{title}</div>
          <div className="text-2xl font-semibold text-white">{value}</div>
        </div>
      </div>
    </div>
  )
}

function Badge({ status }) {
  const map = {
    'Activo': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Por vencer': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'Vencido': 'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return <span className={`px-2 py-0.5 rounded-md text-xs border ${map[status] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>{status}</span>
}

function Sidebar({ role, onSeed }) {
  return (
    <aside className="w-64 bg-black/60 border-r border-slate-800 hidden md:flex flex-col">
      <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">💪</div>
        <div className="text-white font-semibold">GymControl AI</div>
      </div>
      <nav className="p-3 space-y-1 text-slate-300">
        <NavItem icon={LayoutDashboard} label="Dashboard" active />
        <NavItem icon={Users} label="Socios" />
        <NavItem icon={BadgeCheck} label="Membresías" />
        <NavItem icon={CreditCard} label="Pagos" />
        <NavItem icon={CalendarDays} label="Asistencias" />
        {role === 'admin' && <NavItem icon={Coins} label="Planes" />}
        {role === 'admin' && <NavItem icon={Settings} label="Configuración" />}
        {role === 'admin' && <NavItem icon={Shield} label="Usuarios" />}
      </nav>
      <div className="mt-auto p-3 text-xs text-slate-400 border-t border-slate-800">
        <button onClick={onSeed} className="text-emerald-400 hover:text-emerald-300">Cargar datos demo</button>
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer ${active ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/60'}`}>
      <Icon className="w-4 h-4" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

function TopBar({ gymName, user }) {
  return (
    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4">
      <div className="text-slate-300">{gymName}</div>
      <div className="flex items-center gap-3 text-slate-300">
        <div className="text-right">
          <div className="text-white text-sm">{user?.name || 'Demo Admin'}</div>
          <div className="text-xs text-slate-400">{user?.role || 'admin'}</div>
        </div>
        <button className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center gap-2"><LogOut className="w-3.5 h-3.5"/> Cerrar sesión</button>
      </div>
    </header>
  )
}

function ExpiringTable({ items }) {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
      <div className="text-white font-medium mb-3">Membresías por vencer</div>
      <div className="space-y-2">
        {(items || []).map((it, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-slate-200 text-sm">{it.member_name || 'Socio'}</div>
              <div className="text-slate-400 text-xs">{it.plan_name}</div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={it.badge || 'Por vencer'} />
              <button className="text-emerald-400 text-xs flex items-center gap-1 hover:text-emerald-300">Ver <ChevronRight className="w-3 h-3"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PaymentsChart({ data }) {
  return (
    <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
      <div className="text-white font-medium mb-3">Pagos por día (últimos 30 días)</div>
      <div className="h-40 flex items-end gap-1">
        {data.map((d, i) => (
          <div key={i} title={`$${d.amount.toFixed(0)} - ${d.date}`} className="flex-1 bg-emerald-500/30" style={{ height: Math.min(100, Math.round(d.amount)) + '%' }}></div>
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-2">Simple bar chart</div>
    </div>
  )
}

export default function App() {
  const [role] = useState('admin')
  const [settings, setSettings] = useState({ gym_name: 'Mi Gimnasio' })
  const [stats, setStats] = useState({ active_members: 0, expiring_soon: 0, expired_this_month: 0, monthly_revenue: 0 })
  const [daily, setDaily] = useState([])

  useEffect(() => {
    api.getSettings().then(setSettings).catch(()=>{})
    api.statsOverview().then(setStats).catch(()=>{})
    api.statsPaymentsDaily().then(setDaily).catch(()=>{})
  }, [])

  const seed = async () => {
    await api.seed()
    const [s, st, d] = await Promise.all([
      api.getSettings(), api.statsOverview(), api.statsPaymentsDaily()
    ])
    setSettings(s); setStats(st); setDaily(d)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050509] to-[#0A0A0A] text-slate-200">
      <div className="flex">
        <Sidebar role={role} onSeed={seed} />
        <div className="flex-1 min-h-screen flex flex-col">
          <TopBar gymName={settings.gym_name} user={{ name: 'Usuario Demo', role }} />
          <main className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-white">Resumen general</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Socios activos" value={stats.active_members} icon={Users} accent="green"/>
              <StatCard title="Membresías por vencer" value={stats.expiring_soon} icon={BadgeCheck} accent="yellow"/>
              <StatCard title="Membresías vencidas este mes" value={stats.expired_this_month} icon={CalendarDays} accent="red"/>
              <StatCard title="Ingresos de este mes" value={`$${stats.monthly_revenue?.toFixed?.(0) || 0}`} icon={CreditCard} accent="blue"/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ExpiringTable items={[]} />
              <PaymentsChart data={daily} />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
