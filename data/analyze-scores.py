import json
from statistics import mean, median, mode, multimode

def analyze_data(json_file):
    # Load the JSON data
    with open(json_file, 'r') as file:
        data = json.load(file)

    # Extract fields
    internet_scores = [item["internetFreedomScore"] for item in data]
    statuses = [item["status"] for item in data]
    access_scores = [item["accessScore"] for item in data]
    content_scores = [item["contentScore"] for item in data]
    rights_scores = [item["rightsScore"] for item in data]

    # Helper function for range and min/max analysis
    def get_range_analysis(scores, field_name):
        min_score = min(scores)
        max_score = max(scores)
        min_countries = [item["country"] for item in data if item[field_name] == min_score]
        max_countries = [item["country"] for item in data if item[field_name] == max_score]
        score_mean = mean(scores)
        score_median = median(scores)
        try:
            score_mode = mode(scores)
        except:
            score_mode = multimode(scores)  # Handle multiple modes or no mode to account for ties in frequency
        return {
            "range": max_score - min_score,
            "min_score": min_score,
            "max_score": max_score,
            "min_countries": min_countries,
            "max_countries": max_countries,
            "mean": score_mean,
            "median": score_median,
            "mode": score_mode,
        }

    # Analyze internetFreedomScore
    internet_analysis = get_range_analysis(internet_scores, "internetFreedomScore")

    # Analyze statuses
    status_counts = {
        "f": statuses.count("F"),
        "pf": statuses.count("PF"),
        "nf": statuses.count("NF"),
    }
    status_lists = {
        "f": [item["country"] for item in data if item["status"] == "F"],
        "pf": [item["country"] for item in data if item["status"] == "PF"],
        "nf": [item["country"] for item in data if item["status"] == "NF"],
    }

    # Analyze accessScore, contentScore, and rightsScore
    access_analysis = get_range_analysis(access_scores, "accessScore")
    content_analysis = get_range_analysis(content_scores, "contentScore")
    rights_analysis = get_range_analysis(rights_scores, "rightsScore")

    # Output the analysis
    results = {
        "internet_freedom_score": internet_analysis,
        "statuses": {
            "counts": status_counts,
            "lists": status_lists,
        },
        "access_score": access_analysis,
        "content_score": content_analysis,
        "rights_score": rights_analysis,
    }

    return results

# File path to the JSON file
json_file_path = "2024_internet_freedom_scores.json"
output_file_path = "analysis_results.json"

# Run analysis and save results
analysis_results = analyze_data(json_file_path)

# Save the output to a JSON file
with open(output_file_path, 'w') as output_file:
    json.dump(analysis_results, output_file, indent=4)

print(f"Analysis results saved to {output_file_path}")
