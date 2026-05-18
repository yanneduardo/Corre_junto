#  Planejamento das Sprints - CorreJunto

**Link para o Quadro Kanban:** [Corre_junto - GitHub Issues](https://github.com/users/yanneduardo/projects/2/views/1)

---

##  Visão Geral do Projeto

O **CorreJunto** é um sistema web para corredores que facilita a organização de treinos em grupo, divulgação de provas de corrida e compartilhamento de dicas sobre o esporte.

**Duração estimada:** 4 sprints (8 semanas / 2 meses)  
**Metodologia:** Scrum  
**Duração da Sprint:** 2 semanas

---

##  Sprint 1 - Fundamentos e HU01: Criar Treino em Grupo

**Período:** Semanas 1-2  
**Objetivo:** Estabelecer a infraestrutura básica do projeto e implementar a funcionalidade completa de criação de treinos.

### Entregáveis:
- Configuração do ambiente de desenvolvimento (frontend + backend)
- Configuração do banco de dados
- Sistema de autenticação básico (login/cadastro)
- Modelo de dados para Usuário e Treino
- Interface para criação de treino
  - Data e horário
  - Local do encontro
  - Tipo de treino (corrida leve, intervalado, longão)
  - Descrição
- Listagem de treinos disponíveis
- Visualização detalhada de treino
- Funcionalidade de cancelamento (apenas criador)
- Validações de formulário

### História de Usuário:
> **HU01:** Como corredor, quero criar um treino em grupo para encontrar pessoas com ritmo e objetivos semelhantes, facilitando a organização de corridas coletivas.

### Meta de Conclusão:
Sistema básico funcionando com autenticação e criação de treinos operacional.

---

## Sprint 2 - Participação em Treinos e HU02: Perfil do Corredor

**Período:** Semanas 3-4  
**Objetivo:** Permitir participação em treinos e implementar perfis personalizáveis de usuários.

### Entregáveis:
- Modelo de dados para Participação
- Botão "Participar" e "Sair do treino"
- Lista de participantes do treino
- Geração de evento para calendário 
- Modelo de dados do Perfil estendido
- Interface de edição de perfil
  - Biografia
  - Nível de corrida (iniciante, intermediário, avançado)
  - Link de contato (WhatsApp)
- Visualização pública do perfil
- Contador de treinos criados e participados

### História de Usuário:
> **HU02:** Como corredor, quero personalizar meu perfil para compartilhar meu nível de experiência e facilitar o contato com outros participantes.

### Meta de Conclusão:
Módulo de Treinos completo (criação + participação) e perfis de usuário funcionais.

---

## 🏁 Sprint 3 - HU03: Divulgação de Provas de Corrida

**Período:** Semanas 5-6  
**Objetivo:** Implementar o sistema completo de solicitação, moderação e visualização de provas.

### Entregáveis:
- Modelo de dados para Prova
- Interface para solicitar divulgação de prova
  - Data da prova
  - Data limite de inscrição
  - Valores (inscrição)
  - Percurso/Local
  - Distância (5km, 10km, 21km, 42km)
  - Informações adicionais
- Sistema de status (pendente/aprovado/recusado)
- Sistema de permissões (usuário comum vs gerente)
- Dashboard de moderação para gerentes
- Funcionalidade de aprovar/recusar provas
- Listagem pública de provas aprovadas
- Visualização detalhada de prova
- Notificações sobre status da solicitação

### História de Usuário:
> **HU03:** Como corredor, quero divulgar provas de corrida na plataforma para ajudar outras pessoas a encontrarem eventos relevantes e planejarem sua participação com antecedência.

### Meta de Conclusão:
Sistema de provas completo com moderação funcional.

---

## Sprint 4 - Dicas, Refinamentos e Deploy

**Período:** Semanas 7-8  
**Objetivo:** Implementar módulo de dicas, polir a aplicação e preparar para produção.

### Entregáveis:
- Modelo de dados para Dicas
- Interface para criar e visualizar dicas
  - Título
  - Conteúdo
  - Categoria (alimentação, treino, equipamento, recuperação)
  - Autor
- Listagem de dicas com filtros
- Implementação de feedback visual e loading states
- Melhorias de responsividade (mobile-first)
- Otimização de performance
- Correção de bugs identificados
- Testes de integração principais
- Documentação técnica básica
- Deploy em ambiente de produção
- Configuração de monitoramento básico

### Meta de Conclusão:
Sistema completo, funcional, testado e em produção com todas as funcionalidades principais implementadas.

---

## Papéis da Equipe

- **Product Owner:** A definir
- **Scrum Master:** A definir
- **Development Team:**
  - Hugo Augusto Silva de Faria
  - Yann Eduardo
  - Lucas Arthur Menezes Freire
  - Lucas Oliveira Brandão
  - Victor

---

**Última atualização:** Sprint 1 em andamento  
**Próxima revisão:** Final da Sprint 1  
**Prazo final:** 8 semanas a partir do início
