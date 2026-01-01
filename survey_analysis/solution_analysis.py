'''
Docstring for survey_analysis.solution_analysis
For reviewing the 2 solutions columns in non_numeric_clean.csv
Performed NLP tasks to automate the categorizing of columns
'''

import pandas as pd
import numpy as np
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from matplotlib import pyplot as plt
from wordcloud import WordCloud
import seaborn as sns
def preprocess(CSV_PATH:str,colnum:int):
    '''
    Preprocess solutions col.
    - strip leading and trailing whitespaces
    - casefold
    - remove stop words?
    
    '''
    df = pd.read_csv(CSV_PATH)

    solns = df.iloc[:,colnum]

    # Strip and casefold
    for i in range(len(solns)):
        df.iloc[i,colnum] = str(df.iloc[i,colnum]).strip().casefold() if df.iloc[i,colnum] != np.nan else np.nan 
        

    # remove stopwords and puncts

    stop_words = set(stopwords.words('english'))
    puncts = [',','.','-','_','`',';']

    text = ""
    for i in range(len(solns)):
        sol = df.iloc[i,colnum]
        if sol == np.nan:
            pass
        wordlist = word_tokenize(sol)
        print(wordlist)
        wordlist = [w for w in wordlist if (w not in stop_words) and (w not in puncts)]
        df.iloc[i,colnum] = ';'.join(wordlist)
        
        text += ' '.join(wordlist)

    print("AFTER STRIPPING CASEFOLDING AND STOPWORD REMOVAL: \n\n", solns.unique())
    # stop_words.add("code")
    # stop_words.add("error")
    # stop_words.add("like")
    # stop_words.add("would")
    # stop_words.add("solution")
    # stop_words.add("problem")
    # stop_words.add("nothing")
    # stop_words.add("nan")
    # wc = WordCloud(collocations=True,normalize_plurals=True,width=800, height=400, background_color='white',colormap='viridis',stopwords=stop_words).generate(text)
    # plt.figure(figsize=(10, 5))
    # plt.imshow(wc, interpolation='bilinear') # 'bilinear' makes it smoother
    # plt.axis('off') 
    # plt.title("POSSIBLE SOLUTIONS")
    # plt.show()

def visualise(CSV_PATH: str, colnum: int):
    df = pd.read_csv(CSV_PATH)
    categories = {}
    question = df.iloc[:,colnum]

    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() for c in cats]
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    print(f"CATEGORIES IN COLUMN \n{question.describe()} : \n({len(categories)}) {categories}")
    sns.set_theme(style="whitegrid")
    plt.figure(figsize=(10, 6))
    ax = sns.barplot(x=list(categories.values()), y = [k[:20]+"..." if len(k) > 20 else k for k in categories.keys()], hue=list(categories.values()), 
                legend=False,palette="magma")
    
    ax.bar_label(ax.containers[0], padding=3)
    ax.set(title=question.name, xlabel="Count", ylabel="Categories")
    plt.tight_layout()
    plt.show()
def main():

    # preprocess("NON_NUMERIC_CLEAN.csv",colnum = 12)
    # preprocess("NON_NUMERIC_CLEAN.csv",colnum = 13)

    visualise("NON_NUMERIC_CLEAN.csv",colnum=6)
    visualise("NON_NUMERIC_CLEAN.csv",colnum=7)
    visualise("NON_NUMERIC_CLEAN.csv",colnum=8)
    visualise("NON_NUMERIC_CLEAN.csv",colnum=9)

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=10)
    # visualise("NON_NUMERIC_CLEAN.csv",colnum=11)

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=12)
    # visualise("NON_NUMERIC_CLEAN.csv",colnum=13)

if __name__ == "__main__":
    main()