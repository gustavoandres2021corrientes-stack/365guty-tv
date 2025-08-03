import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel de Administración - 365GUTY💙-TV',
  description: 'Panel de control administrativo para gestionar contenido y usuarios',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}