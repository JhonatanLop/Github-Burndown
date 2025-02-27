# Git Project Status

Este projeto é um gráfico burndown automatizado que utiliza a API pública do github para buscar as informações necessárias para a reenderização do gráfico.
O objetivo é ajudar quem deseja ter transparência no andamento de um projeto de um jeito fácil e acessível.

## Ferramentas Utilizadas

- Vite
- React
- TypeScript

## Instalação

1. Clone o repositório:
  ```bash
  git clone https://github.com/jhonatanLop/git-project-status.git
  ```

2. Navegue até o diretório do projeto:
  ```bash
  cd git-project-status
  ```

3. Instale as dependências necessárias:
  ```bash
  npm install
  ```


## Uso

1. Crie um arquivo .env e adicione as seguintes configurações
```bash
VITE_GITHUB_TOKEN=your-github-token
VITE_GIT_REPO=your-github-repo,another-gihub-repo
VITE_SPRINT_DURATION=21
VITE_GIT_OWNER=your-github-username
```

É possível colocar mais de um repositório caso opere em sub-module serparados por vírgula e sem espaço.

2. Para executar o projeto
```bash
npm run dev
```

## Configuração

Para que o gráfico opere corretamente, é necessário fazer algumas configurações no(s) repositório(s).

1. Criação das milestones.
As milestones serão as sprints, na criação da milestone é necessário definir a data de encerramento e no arquivo .env colocar a quantidade de dias na sprint. Isso será usado para calcular a data de início da sprint.
> **Importante:** Em caso de sub-module, certifique-se de que as configurações das Milestones sejam as mesmas em ambos os repositórios

2. Criação das labels.
A criação das lables é necessária pois serão utilizadas para o cálculo da queima de pontos e construção do gráfico.
As labels a serem criadas são exatamente `high`, `medium`, e `low` que representam os níveis de prioridade.
> Tanto os títulos das labels quanto os valores que os representam podem ser alteradas no em `/src/services/issues.ts em splitIssuesAndPullRequests()
```typescript
switch (label.name) {
    case "low":
        issue.priority = 1;
        break;
    case "medium":
        issue.priority = 2;
        break;
    case "high":
        issue.priority = 3;
        break;
    default:
        issue.priority = 1;
        break;
}
```