# Project Diagrams

This document contains the architectural and design diagrams for the **AI Coaching Voice Agent**.

> **Note**: These diagrams are written in [Mermaid](https://mermaid.js.org/) syntax. You can view them directly in VS Code if you have a Mermaid extension installed, or copy the code blocks into the [Mermaid Live Editor](https://mermaid.live/) to generate and download PNG images.

## 1. Use Case Diagram

Describes the user's interactions with the system.

```mermaid
usecaseDiagram
    actor User
    
    package "AI Coaching Voice Agent" {
        usecase "Login / Sign Up" as UC1
        usecase "View Dashboard" as UC2
        usecase "Select Coaching Option" as UC3
        usecase "Start Coaching Session" as UC4
        usecase "View History" as UC5
        usecase "View Feedback" as UC6
        usecase "Manage Profile" as UC7
    }

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    UC3 --> (Lecture on Topic)
    UC3 --> (Mock Interview)
    UC3 --> (Ques Ans Prep)
    UC3 --> (Languages Skill)
    UC3 --> (Meditation)
```

## 2. System Architecture Diagram

High-level overview of the system components and their interactions.

```mermaid
graph TB
    subgraph Client ["Client Side (Next.js)"]
        UI[User Interface / React Components]
        AuthClient[Stack Auth Client]
        ConvexClient[Convex React Client]
    end

    subgraph Backend ["Backend Services"]
        Convex[Convex (Database & Edge Functions)]
        StackAuth[Stack Auth (Authentication)]
    end

    subgraph External ["External AI Services"]
        OpenAI[OpenAI API]
        AssemblyAI[AssemblyAI (Speech-to-Text)]
        Polly[AWS Polly (Text-to-Speech)]
    end

    UI --> AuthClient
    UI --> ConvexClient
    AuthClient --> StackAuth
    ConvexClient --> Convex
    Convex --> OpenAI
    Convex --> AssemblyAI
    Convex --> Polly
```

## 3. Class Diagram

Represents the structure of key React components and data objects.

```mermaid
classDiagram
    class AuthProvider {
        +UserContext
        +CreateNewUser()
    }
    class Dashboard {
        +render()
    }
    class FeatureAssistants {
        +CoachingOptions
        +render()
    }
    class UserInputDialog {
        -selectedExpert
        -topic
        -loading
        +OnClickNext()
    }
    class CoachingOption {
        +String name
        +String icon
        +String prompt
    }
    class CoachingExpert {
        +String name
        +String avatar
    }

    Dashboard --> FeatureAssistants
    Dashboard --> History
    Dashboard --> Feedback
    FeatureAssistants --> UserInputDialog
    FeatureAssistants --> CoachingOption
    UserInputDialog --> CoachingExpert
    AuthProvider --> UserContext
```

## 4. ER Diagram (Entity Relationship)

Database schema defined in Convex.

```mermaid
erDiagram
    USERS {
        string name
        string email
        number credits
        string subscriptionId
    }

    DISCUSSION_ROOM {
        id _id
        string coachingOption
        string topic
        string expertName
        json conversation
    }

    USERS ||--o{ DISCUSSION_ROOM : "creates"
```

## 5. Data Flow Diagram (DFD)

Flow of data through the system during a coaching session.

```mermaid
graph LR
    User((User))
    UI[Frontend Interface]
    DB[(Convex Database)]
    AI[AI Processing]

    User -- "Input (Voice/Text)" --> UI
    UI -- "Send Message" --> DB
    DB -- "Trigger Action" --> AI
    AI -- "Generate Response" --> DB
    DB -- "Update Conversation" --> UI
    UI -- "Display/Speak Response" --> User
```

## 6. Sequence Diagram

The process flow for starting a new coaching session.

```mermaid
sequenceDiagram
    actor User
    participant Dashboard
    participant Dialog as UserInputDialog
    participant Convex as Convex Backend
    participant Router

    User->>Dashboard: Select Coaching Option
    Dashboard->>Dialog: Open Dialog
    User->>Dialog: Enter Topic & Select Expert
    User->>Dialog: Click Next
    Dialog->>Convex: CreateNewRoom(topic, expert, option)
    activate Convex
    Convex-->>Dialog: Return roomId
    deactivate Convex
    Dialog->>Router: Navigate to /discussion-room/{roomId}
    Router-->>User: Show Discussion Room
```

## 7. Flow Chart

User journey flow.

```mermaid
flowchart TD
    Start([Start]) --> Login{Is Logged In?}
    Login -- No --> Auth[Authenticate with Stack]
    Auth --> Login
    Login -- Yes --> Dashboard[Dashboard]
    
    Dashboard --> Select[Select Coaching Option]
    Select --> Input[Enter Topic & Expert]
    Input --> Create[Create Session]
    Create --> Session[Interactive Session]
    
    Session --> End{End Session?}
    End -- No --> Session
    End -- Yes --> Feedback[View Feedback]
    Feedback --> Dashboard
```

## 8. Deployment Diagram

Physical/Cloud deployment structure.

```mermaid
graph TB
    node ClientDevice [Client Device] {
        artifact Browser
    }

    node Cloud [Cloud Infrastructure] {
        node Vercel [Vercel Hosting] {
            artifact NextJS_App
        }
        
        node ConvexCloud [Convex Cloud] {
            database ConvexDB
            artifact EdgeFunctions
        }
        
        node StackCloud [Stack Auth Cloud] {
            artifact AuthServer
        }
    }

    Browser -- HTTPS --> NextJS_App
    Browser -- WSS/HTTPS --> ConvexCloud
    Browser -- HTTPS --> StackCloud
```
