'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, User, Sparkles, Lightbulb, Target, Megaphone, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useApi } from '@/lib/hooks/useApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = [
  { label: 'Crear campaña', prompt: 'Quiero crear una nueva campaña de marketing. ¿Puedes guiarme?', icon: Megaphone, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'Gestionar leads', prompt: '¿Cómo funciona la gestión de leads?', icon: Target, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'Consejos de ventas', prompt: '¿Qué consejos me das para mejorar mis ventas de seguros?', icon: Lightbulb, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  { label: 'Ayuda del sistema', prompt: '¿Cómo uso el sistema CRM?', icon: HelpCircle, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
];

export default function VictoriaPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: '¡Hola! 👋 Soy **Victoria**, tu asistente de IA para el CRM de Seguros.\n\nPuedo ayudarte con:\n• Crear y optimizar campañas\n• Gestionar leads y clientes\n• Consejos de ventas\n• Guiarte en el sistema\n\n¿En qué puedo ayudarte?', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { post } = useApi();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: content.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await post('/assistant', { messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })) });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success ? (data as any).message : 'Lo siento, hubo un error. Intenta de nuevo.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Error de conexión.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex flex-col items-center justify-center py-6 mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border">
        <div className="h-20 w-20 rounded-full overflow-hidden mb-3 ring-4 ring-purple-200">
          <Image src="/images/victoria-avatar.png" alt="Victoria" width={80} height={80} className="object-cover" />
        </div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Victoria <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"><Sparkles className="h-3 w-3 mr-1" />IA</Badge>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Tu asistente inteligente de CRM</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div key={message.id} className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'assistant' && (
                      <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200">
                        <Image src="/images/victoria-avatar.png" alt="Victoria" width={36} height={36} className="object-cover" />
                      </div>
                    )}
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-3', message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900')}>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-9 w-9 flex-shrink-0"><AvatarFallback className="bg-slate-700 text-white"><User className="h-5 w-5" /></AvatarFallback></Avatar>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-purple-200">
                      <Image src="/images/victoria-avatar.png" alt="Victoria" width={36} height={36} className="object-cover" />
                    </div>
                    <div className="bg-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-purple-600" /><span className="text-sm text-slate-500">Victoria está escribiendo...</span></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu mensaje..." disabled={loading} className="flex-1 h-12" />
                <Button type="submit" size="lg" disabled={loading || !input.trim()} className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        <Card className="w-72 flex-shrink-0 hidden lg:block">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />Acciones Rápidas</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.label} variant="ghost" className={cn('w-full justify-start h-auto py-3 px-3', action.color)} onClick={() => sendMessage(action.prompt)} disabled={loading}>
                <action.icon className="h-4 w-4 mr-2 flex-shrink-0" /><span className="text-sm">{action.label}</span>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
