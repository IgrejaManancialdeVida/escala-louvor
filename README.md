# Escala do Ministério de Louvor e Adoração
### Igreja Manancial de Vida

Aplicativo web progressivo (PWA) para gerenciamento da escala do ministério de música.

---

## 🚀 Como publicar no GitHub Pages

1. Crie um repositório no GitHub (ex: `escala-louvor`)
2. Faça upload de todos estes arquivos para a branch `main`
3. Vá em **Settings → Pages**
4. Em "Source", selecione `main` e a pasta raiz `/`
5. Clique em **Save**
6. Aguarde alguns minutos — o app estará disponível em `https://seu-usuario.github.io/escala-louvor/`

---

## 📱 Como instalar no celular (Android)

1. Acesse o link do GitHub Pages pelo Chrome
2. Toque nos três pontinhos (menu)
3. Selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**
4. O app aparecerá como um ícone nativo no seu celular

---

## 🔐 Acesso Administrativo

- Toque no ícone de usuário no canto superior direito
- Senha padrão: **`manancial2025`**
- Com acesso admin, é possível criar, editar e excluir escalas
- Os dados ficam salvos localmente no dispositivo via `localStorage`

---

## 📋 Funcionalidades

- ✅ **Próxima Escala** — Destaque do próximo evento com equipe completa
- ✅ **Por Mês** — Visualização de todos os eventos do mês com navegação
- ✅ **Histórico** — Registro de escalas passadas
- ✅ **Dicas** — Cards educativos sobre comportamento e técnica
- ✅ **Admin** — Criação/exclusão de escalas com senha
- ✅ **Sugestão automática de horário** — Domingo 19h, Terça/Quinta 19h30
- ✅ **PWA** — Instalável no celular como app nativo
- ✅ **Offline** — Funciona sem internet após primeira visita

---

## 🗂️ Estrutura dos Arquivos

```
escala-louvor/
├── index.html        # App principal
├── style.css         # Estilos (Dark Glassmorphism)
├── app.js            # Lógica JavaScript
├── manifest.json     # Configuração PWA
├── sw.js             # Service Worker (offline)
├── logo-igreja.jpg   # Logo da Igreja Manancial de Vida
├── icons/
│   ├── icon-192.png  # Ícone PWA 192px
│   └── icon-512.png  # Ícone PWA 512px
└── README.md
```

---

*Desenvolvido com HTML5, CSS3 (Glassmorphism) e JavaScript puro — sem dependências externas.*
