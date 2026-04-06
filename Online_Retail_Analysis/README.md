# Data Analytics Environment

This is a structured environment designed to house various Data Analytics projects.

## Directory Structure

```text
Online_Retail_Analysis/
├── .venv/                      # Shared Python virtual environment
├── requirements.txt            # Common packages
├── .gitignore                  # Git ignore rules for the workspace
└── data/
    ├── raw/                    # Unmodified raw data (e.g., CSVs)
    └── processed/              # Cleaned dataset outputs
├── notebooks/                  # Jupyter Notebooks for exploration
├── src/                        # Custom python modules/scripts
└── reports/                    # Output analysis files/figures
```

## Setup Instructions

1. **Move your dataset:**
   Move `online_retail_II.csv` into `Online_Retail_Analysis/data/raw/`.

2. **Activate the Virtual Environment:**
   Open a terminal in `Project/Online_Retail_Analysis/` and run:
   ```bash
   source .venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launching Jupyter Notebooks:**
   Once the environment is active, start Jupyter Lab/Notebook:
   ```bash
   jupyter notebook
   ```
