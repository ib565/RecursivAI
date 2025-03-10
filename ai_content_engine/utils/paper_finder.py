import requests
import datetime
import json
import time


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
                    time.sleep(0.1)
                    repos_url = f"{papers_with_code_base}{paper['id']}/repositories/"
                    repos_response = requests.get(repos_url)
                    repos = repos_response.json()["results"]
                    stars = 0
                    for repo in repos:
                        stars += repo["stars"]

                    if stars > 10:
                        paper_dict = {
                            "title": paper["title"],
                            "url": paper["url_pdf"],
                            "published": paper["published"],
                            "abstract": paper["abstract"],
                            "github_stars": stars,
                        }
                        papers.append(paper_dict)
                        print(paper_dict)
                else:
                    break
        if last_date < threshold_date:
            break
        page += 1
        time.sleep(1)

    top_papers = sorted(papers, key=lambda x: x["github_stars"], reverse=True)

    return top_papers


def save_papers(papers, filename="ai_content_engine/content/top_papers.json"):
    data = {"last_updated": datetime.datetime.now().isoformat(), "papers": papers}
    today = datetime.datetime.now().strftime("%d-%m-%Y")
    filename = filename.replace(".json", f"_{today}.json")
    with open(filename, "w") as f:
        json.dump(data, f, indent=2)


def deduplicate_papers(papers):
    seen = set()
    unique_papers = []

    for paper in papers:
        key = (paper["title"], paper["url"])
        if key not in seen:
            seen.add(key)
            unique_papers.append(paper)

    return unique_papers


def find_top_papers():
    top_papers = get_top_papers()
    top_papers_unique = deduplicate_papers(top_papers)
    save_papers(top_papers_unique[:10])


if __name__ == "__main__":
    find_top_papers()
