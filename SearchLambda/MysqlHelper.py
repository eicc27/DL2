import mysql.connector as connector
from mysql.connector.cursor import RowType


class MysqlHelper:
    def __init__(self,
                 url='database-test.cb6gwcrbia4j.us-east-1.rds.amazonaws.com',
                 user='admin',
                 pwd='Jise246808642',
                 db='dl2') -> None:
        self.conn = connector.connect(
            host=url,
            user=user,
            password=pwd,
            database=db,
            collation='utf8mb4_general_ci')
        self.conn.autocommit = False  # disable autocommit
        self.cursor = self.conn.cursor()

    def getPapers(self, start: int = -1, count: int = -1) -> list[tuple[str, str]]:
        params = (start, count)
        if start < 0 or count < 0:
            self.cursor.execute(
                """
                    select title, abstract, arxiv_id from paper
                """)
        else:
            self.cursor.execute(
                """
                select title, abstract, arxiv_id from paper
                limit %s, %s
                """,
                params)
        return self.cursor.fetchall()

    def close(self) -> None:
        self.conn.commit()
        self.conn.close()

    def _getPaperByTitle(self, query: str) -> list[RowType]:
        params = (query,)
        self.cursor.execute(
            """
                select arxiv_id from paper
                    where title = %s
                order by citations desc, year desc
                limit 10;
            """,
            params)
        return self.cursor.fetchall()

    def _getPaperByArxivId(self, arxivId: str) -> RowType:
        params = (arxivId,)
        self.cursor.execute(
            'SELECT * FROM paper WHERE arxiv_id = %s',
            params)
        return self.cursor.fetchone()

    def _getAuthorPapersByPaperId(self, paperId: str) -> list[RowType]:
        params = (paperId,)
        self.cursor.execute(
            'SELECT * FROM author_paper WHERE paperid = %s',
            params)
        return self.cursor.fetchall()

    def _getCodesByPaperId(self, paperId: str) -> list[RowType]:
        params = (paperId,)
        self.cursor.execute(
            'SELECT * FROM code WHERE paperid = %s',
            params)
        return self.cursor.fetchall()

    def _getMostPopularTasksByNumOfPapers(self, paperId: str) -> list[RowType]:
        params = (paperId,)
        self.cursor.execute("""
        SELECT taskid, total_papers
            FROM (
                SELECT taskid, COUNT(*) AS total_papers
                FROM task_paper
                GROUP BY taskid
            ) AS total_counts
            WHERE taskid IN (
                SELECT taskid
                FROM task_paper
                WHERE paperid = %s
            )
            ORDER BY total_papers DESC
            LIMIT 5;
                            """,
                            params)
        return self.cursor.fetchall()

    def _getMostPopularMethodsByNumOfPapers(self, paperId: str) -> list[RowType]:
        params = (paperId,)
        self.cursor.execute("""
        SELECT methodid, total_papers
            FROM (
                SELECT methodid, COUNT(*) AS total_papers
                FROM method_paper
                GROUP BY methodid
            ) AS total_counts
            WHERE methodid IN (
                SELECT methodid
                FROM method_paper
                WHERE paperid = %s
            )
            ORDER BY total_papers DESC
            LIMIT 5;
                            """,
                            params)
        return self.cursor.fetchall()

    def _getPaperRespByArxivId(self, arxivId: str):
        paper = self._getPaperByArxivId(arxivId)
        if paper is None:
            return None
        tasks = self._getMostPopularTasksByNumOfPapers(arxivId)
        methods = self._getMostPopularMethodsByNumOfPapers(arxivId)
        authors = self._getAuthorPapersByPaperId(arxivId)
        codes = self._getCodesByPaperId(arxivId)
        return {
            'arxivId': arxivId,
            'title': paper[1],
            'abs': paper[2],
            'citations': paper[3],
            'authors': [a[0] for a in authors],
            'tasks': {
                'taskName': [t[0] for t in tasks],
                'numPapers': [t[1] for t in tasks]
            },
            'methods': {
                'methodName': [m[0] for m in methods],
                'numPapers': [m[1] for m in methods]
            },
            'codes': [{
                'url': c[1],
                'rating': c[0]
            } for c in codes],
        }

    def getPaperByArxivIds(self, arxivIds: list[str]):
        try:
            return [self._getPaperRespByArxivId(arxivId) for arxivId in arxivIds]
        except connector.Error as err:
            print(err)
            return None
        finally:
            self.conn.commit()
            self.conn.close()

    def getPaperByArxivId(self, arxivId: str):
        try:
            return self._getPaperRespByArxivId(arxivId)
        except connector.Error as err:
            print(err)
            return None
        finally:
            self.conn.commit()
            self.conn.close()

    def getPaperByTitle(self, query: str):
        try:
            arxiv_ids = self._getPaperByTitle(query)
            return self.getPaperByArxivIds(arxiv_ids)
        except connector.Error as err:
            print(err)
            return None
        finally:
            self.conn.commit()
            self.conn.close()


if __name__ == '__main__':
    helper = MysqlHelper()
    result = helper.getPaperByTitle("Attention")
    print(result)
