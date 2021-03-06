import { sub } from 'date-fns';
import slugify from 'slugify';

export const findOrCreateBoard = async (knex, id, name) =>
  knex
    .transaction((trx) =>
      trx('boards')
        .whereRaw('id = ?', id)
        .then((res) => {
          if (res.length === 0) {
            return trx('boards')
              .insert({
                id,
                name,
                jira_url: `https://jira.towa-digital.com/secure/RapidBoard.jspa?rapidView=${id}`,
              })
              .then(() => trx('boards').whereRaw('id = ?', id));
          } else {
            return res;
          }
        }),
    )
    .then((res) => res[0]);

export const createOrUpdateSprint = async (knex, id, sprint) =>
  knex.transaction((trx) =>
    trx('sprints')
      .whereRaw('id = ?', id)
      .then((res) => {
        if (res.length === 0) {
          return trx('sprints').insert({
            id: sprint.id,
            name: sprint.name,
            boardId: sprint.originBoardId,
            startDate: new Date(sprint.startDate),
            endDate: new Date(sprint.endDate),
            forecast: sprint.forecast,
            achievement: 0,
            slug:
              sprint.slug ||
              slugify(sprint.name, {
                lower: true,
                locale: 'de',
                remove: /[*+~.()'"!:@]/g,
              }),
          });
        } else {
          return trx('sprints')
            .whereRaw('id = ?', id)
            .update({
              name: sprint.name,
              boardId: sprint.originBoardId,
              startDate: new Date(sprint.startDate),
              endDate: new Date(sprint.endDate),
              forecast: sprint.forecast,
              achievement: 0,
              slug:
                sprint.slug ||
                slugify(sprint.name, {
                  lower: true,
                  locale: 'de',
                  remove: /[*+~.()'"!:@]/g,
                }),
            });
        }
      }),
  );

export const findOrCreateUser = async (
  knex,
  { emailAddress, name, displayName, avatarUrls },
) =>
  knex
    .transaction((trx) =>
      trx('users')
        .whereRaw('email = ?', emailAddress)
        .then((res) => {
          if (res.length === 0) {
            return trx('users')
              .insert({
                name,
                full_name: displayName,
                email: emailAddress,
                avatar: `${avatarUrls['48x48']}&size=xxlarge`,
              })
              .then(() => trx('users').whereRaw('email = ?', emailAddress));
          } else {
            return res;
          }
        }),
    )
    .then((res) => res[0]);

export const addFavourite = async (knex, dbBoard, dbUser) =>
  await knex('user_has_favourite_boards').insert({
    user_id: dbUser.id,
    board_id: dbBoard.id,
  });

export const removeFavourite = async (knex, dbBoard, dbUser) =>
  await knex('user_has_favourite_boards')
    .where({
      user_id: dbUser.id,
      board_id: dbBoard.id,
    })
    .del();

export const getAllFavouriteBoardsByUser = async (knex, dbUser) =>
  await knex
    .select()
    .from('user_has_favourite_boards')
    .innerJoin('boards', 'user_has_favourite_boards.board_id', '=', 'boards.id')
    .whereRaw('user_has_favourite_boards.user_id = ?', dbUser.id);

export const allSprints = async (knex) =>
  await knex('sprints').whereRaw('endDate > ?', sub(Date.now(), { days: 1 }));

export const getSprintBySlug = async (knex, slug) =>
  await knex
    .select(
      'sprints.id',
      'sprints.name as sprintName',
      'sprints.id',
      'sprints.startDate',
      'sprints.endDate',
      'sprints.forecast',
      'sprints.achievement',
      'sprints.isSaved',
      'presentations.user',
      'presentations.stories',
      'presentations.bugs',
      'presentations.others',
      'presentations.inReview',
      'presentations.assignees',
      'presentations.highlights_impediments',
      'boards.name as boardName',
    )
    .from('sprints')
    .innerJoin('boards', 'boards.id', 'sprints.boardId')
    .leftJoin('presentations', 'presentations.sprint_id', 'sprints.id')
    .whereRaw('sprints.slug = ?', slug);

export const addSprintData = async (knex, id, sprint) =>
  Promise.all(
    await knex('sprints').whereRaw('id = ?', id).update({
      isSaved: true,
      achievement: sprint.achievement,
    }),
    await knex('presentations').insert({
      sprint_id: id,
      user: JSON.stringify(sprint.data.user),
      assignees: JSON.stringify(sprint.data.assignees),
      stories: JSON.stringify(sprint.data.tasks.stories),
      bugs: JSON.stringify(sprint.data.tasks.bugs),
      others: JSON.stringify(sprint.data.tasks.others),
      inReview: JSON.stringify(sprint.data.tasks.inReview),
    }),
  );

export const getAllActivePresentations = async (knex) =>
  await knex
    .select('name', 'slug', 'endDate', 'forecast', 'achievement')
    .from('sprints')
    .where('isSaved', 1)
    .orderBy('endDate', 'desc');
