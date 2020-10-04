import { State } from './state'

const data: State = {
  kind: 'LoggedIn',
  state: {
    users: [
      {
        id: 1,
        name: 'Per',
      },
      {
        id: 2,
        name: 'Petri',
      },
    ],
    stats: [],
    matches: [
      {
        match: {
          id: 278,
          leagueId: 1,
          leagueName: 'International',
          home: {
            id: 6,
            name: 'Germany',
          },
          away: {
            id: 3,
            name: 'Brazil',
          },
          homeUser: {
            id: 2,
            name: 'Petri',
          },
          awayUser: {
            id: 1,
            name: 'Per',
          },
          result: null,
        },
        edit: null,
      },
      {
        match: {
          id: 277,
          leagueId: 1,
          leagueName: 'International',
          home: {
            id: 6,
            name: 'Germany',
          },
          away: {
            id: 3,
            name: 'Brazil',
          },
          homeUser: {
            id: 1,
            name: 'Per',
          },
          awayUser: {
            id: 2,
            name: 'Petri',
          },
          result: null,
        },
        edit: null,
      },
      {
        match: {
          id: 276,
          leagueId: 4,
          leagueName: 'Spain',
          home: {
            id: 22,
            name: 'Real Madrid',
          },
          away: {
            id: 20,
            name: 'Atletico Madrid',
          },
          homeUser: {
            id: 2,
            name: 'Petri',
          },
          awayUser: {
            id: 1,
            name: 'Per',
          },
          result: {
            finishedDate: 'Tuesday   2020-05-19',
            homeScore: 4,
            awayScore: 4,
            finishedType: {
              kind: 'penalties',
              homeGoals: 1,
              awayGoals: 2,
            },
          },
        },
        edit: null,
      },
      {
        match: {
          id: 275,
          leagueId: 4,
          leagueName: 'Spain',
          home: {
            id: 22,
            name: 'Real Madrid',
          },
          away: {
            id: 20,
            name: 'Atletico Madrid',
          },
          homeUser: {
            id: 1,
            name: 'Per',
          },
          awayUser: {
            id: 2,
            name: 'Petri',
          },
          result: {
            finishedDate: 'Monday    2020-04-20',
            homeScore: 2,
            awayScore: 5,
            finishedType: {
              kind: 'fullTime',
            },
          },
        },
        edit: null,
      },
    ],
    create: {
      user1: 1,
      user2: 2,
    },
  },
}

export default data
