# Chat Global - Documento de Arquitectura y Requerimientos

## 1. Descripción General
Una aplicación web sencilla de un "Chat Global". Todos los usuarios que entren a la página web verán la misma sala de chat y podrán enviar mensajes que serán recibidos en tiempo real por los demás usuarios conectados.

## 2. Requerimientos Técnicos
- **Frontend**: Next.js (App Router), Tailwind CSS.
- **Backend/Realtime**: Socket.io para la comunicación bidireccional en tiempo real.
- **Persistencia**: Por ahora, no es necesaria una base de datos compleja. Se puede guardar el historial reciente de mensajes en memoria en el servidor Node.js para que los usuarios nuevos vean los últimos mensajes al conectarse.
- **Identidad**: No hay sistema de login complejo. Los usuarios ingresarán un "nickname" antes de entrar al chat.

## 3. Fases de Desarrollo (Asignación a Sub-Agentes)
**Fase 1 (Arquitecto/Backend):** Configurar el proyecto de Next.js y montar un servidor Node.js/Express con Socket.io en una carpeta separada o integrado en el mismo proyecto usando custom server (preferiblemente separado para facilitar el despliegue en plataformas gratuitas que soporten websockets, como Render + Render Web Service o Vercel + un pequeño backend en Render).
**Fase 2 (Frontend/UI-UX):** Crear la interfaz de usuario. Una pantalla para pedir el nickname y otra pantalla para el chat (lista de mensajes y un input para enviar).

## 4. Estructura de Directorios Propuesta
/chat-global
  /frontend (Next.js)
  /backend (Node.js + Socket.io)
