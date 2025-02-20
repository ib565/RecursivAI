import requests
import datetime
import time
import os
from dotenv import load_dotenv

load_dotenv()


def get_top_papers(days=7):
    threshold_date = (datetime.datetime.now() - datetime.timedelta(days=days)).strftime(
        "%Y-%m-%d"
    )
    papers_with_code_base = "https://paperswithcode.com/api/v1/papers/"

    page = 20

    papers = []
    while True:
        params = {"page": page, "ordering": "-published", "items_per_page": 500}
        response = requests.get(papers_with_code_base, params=params)
        if response.status_code != 200:
            break
        papers_data = response.json()["results"]

        last_date = papers_data[-1].get("published")
        if not last_date:
            page += 1
            continue

        for paper in papers_data:
            if paper.get("published"):
                if paper["published"] >= threshold_date:
                    if not paper.get("authors"):
                        continue

                    repos_url = f"{papers_with_code_base}{paper['id']}/repositories/"
                    repos_response = requests.get(repos_url)
                    repos = repos_response.json()["results"]
                    stars = 0
                    for repo in repos:
                        stars += repo["stars"]

                    if stars > 10:
                        papers.append(
                            {
                                "title": paper["title"],
                                "url": paper["url_pdf"],
                                "published": paper["published"],
                                "abstract": paper["abstract"],
                                "github_stars": stars,
                            }
                        )
                    # time.sleep(0.1)
                else:
                    break
        if last_date < threshold_date:
            break
        page += 1

    top_papers = sorted(papers, key=lambda x: x["github_stars"], reverse=True)

    return top_papers


def get_github_stars(repo_url):
    if not repo_url or "github.com" not in repo_url:
        return 0

    parts = repo_url.split("github.com/")[-1].split("/")
    if len(parts) < 2:
        return 0
    owner, repo = parts[0], parts[1]

    token = os.environ.get("GITHUB_TOKEN")
    github_headers = {
        "Authorization": f"token {token}",
    }

    try:
        response = requests.get(
            f"https://api.github.com/repos/{owner}/{repo}", headers=github_headers
        )
        if response.status_code == 200:
            return response.json().get("stargazers_count", 0)
    except Exception as e:
        print(f"Error fetching stars for {repo_url}: {e}")

    return 0


print(get_top_papers()[:5])
