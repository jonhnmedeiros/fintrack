# Story 1.2: Login e Sessão

Status: done

## Story

As um Titular ou Visualizador,
I want fazer login com email e senha,
So that eu possa acessar meus dados financeiros.

**FRs covered:** FR-20

## Acceptance Criteria

1. Usuário acessa `/login`, vê formulário com email + senha + link "Não tem conta? Cadastre-se"
2. Email e senha corretos → sessão JWT criada, redireciona à dashboard `/`
3. Email ou senha incorretos → erro inline "Email ou senha incorretos"
4. Usuário já autenticado acessa `/login` → redireciona automaticamente para `/`
5. Após registro, auto-login funciona e redireciona para `/`

## Tasks

- [x] Melhorar LoginForm com erro inline (react-hook-form state), link cadastro e loading state
- [x] Adicionar auto-redirect se já autenticado na página de login
