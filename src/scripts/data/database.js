import { openDB } from 'idb';

const DATABASE_NAME = 'citycare-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'citycare';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

export async function getAllReports() {
  return (await dbPromise).getAll(OBJECT_STORE_NAME);
}

export async function getReportById(id) {
  if (!id) {
    throw new Error('`id` is required to retrieve.');
  }

  return (await dbPromise).get(OBJECT_STORE_NAME, id);
}

export async function putReport(report) {
  if (!Object.hasOwn(report, 'id')) {
    throw new Error('`id` is required to save.');
  }

  return (await dbPromise).put(OBJECT_STORE_NAME, report);
}

export async function removeReport(id) {
  return (await dbPromise).delete(OBJECT_STORE_NAME, id);
}
