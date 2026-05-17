# 🏃‍♂️ CorreJunto

## 📌 Ideia Geral

O **CorreJunto** é um sistema web voltado para corredores que desejam encontrar parceiros de treino, divulgar provas de corrida e acessar dicas relacionadas ao esporte.

O objetivo é facilitar a conexão entre pessoas com interesses em comum, incentivando a prática de corrida em grupo e promovendo eventos da comunidade.

---

## 💻 Descrição do Sistema

O sistema é dividido em três principais módulos:

### 🏃‍♀️ Treinos

Permite que usuários criem e participem de treinos em grupo.

#### Funcionalidades:
- Criação de treinos com:
  - Data
  - Horário
  - Local
  - Tipo de treino (corrida leve, intervalado, longão, etc.)
  - Pace médio esperado
- Participação em treinos:
  - Botão **Participar**
  - Botão **Sair do treino**
- Lista de participantes
- Descrição do treino
- Geração automática de evento ao confirmar presença (Google Calendar ou arquivo `.ics`)

---

### 🏁 Provas

Espaço para divulgação de provas de corrida.

#### Funcionalidades:
- Usuários podem solicitar divulgação de provas
- Gerentes analisam e:
  - Aprovam
  - Recusam
- Informações das provas:
  - Data da prova
  - Data limite de inscrição
  - Valores
  - Percurso
  - Distância (5km, 10km, etc.)

---

### 💡 Dicas

Área destinada ao compartilhamento de dicas sobre corrida.

---

### 👤 Perfil do Usuário

Cada usuário possui um perfil com:

- Foto
- Bio
- Nível de corrida
- Quantidade de treinos criados
- Contato com link direto para WhatsApp

---

## 🚫 Limitações

- O sistema **não possui chat interno**
- A comunicação entre usuários será feita externamente (ex: WhatsApp)

---

## 🧩 Entidades Principais

- Usuário
- Treino
- Participação (relação entre usuário e treino)
- Prova

---

## 🔗 Relacionamentos

- Usuário cria → Treino  
- Usuário participa → Treino  
- Usuário solicita → Prova  

---

## 🎯 Objetivo

Desenvolver um sistema simples e funcional que permita:

- Organização de treinos em grupo  
- Divulgação de eventos de corrida  
- Compartilhamento de informações úteis para corredores  

---

## 👥 Integrantes do Projeto

- Hugo Augusto Silva de Faria  
- Yann Eduardo  
- Lucas Arthur Menezes Freire  
- Lucas Oliveira Brandão 
- Victor  
