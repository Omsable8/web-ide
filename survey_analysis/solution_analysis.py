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
from nltk.stem import PorterStemmer

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
    ps = PorterStemmer()

    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else str(np.nan) for c in cats]
        
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


def stacked_bar_col_6():
    
    ######## READ CSV ########
    colnum = 6
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########
    cats = {
                "POOR EDITOR": {},
                "TEMPLATES": {},
                "SUBMISSION": {},
                "MIGRATION": {}, 
                "LACK OF TUTORIAL":{}, 
                'interactive problems':{}, 
                'internet issues':{}
                }

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    for key in categories.keys():
        if key in ('editor settings', 'poor editor', 'language setting'):
            cats['POOR EDITOR'][key] = categories[key]
        elif key in ('file limits', 'submission'):
            cats['SUBMISSION'][key] = categories[key]
        elif key in ('pasting templates', 'handling io'):
            cats['TEMPLATES'][key] = categories[key]
        elif key in ('migration', 'lacks vscode features','autocomplete', 'dependency management', 'importing libs', 'error debugging', 'keyboard shortcuts'):
            cats['MIGRATION'][key] = categories[key]
        elif key in ('not beginner friendly', 'configure compiler'):
            cats['LACK OF TUTORIAL'][key] = categories[key]
        elif key in ["internet issues"]:
            cats['internet issues'][key] = categories[key]
        elif key in ['interactive problems']:
            cats['interactive problems'][key] = categories[key]

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])
    plt.tight_layout()
    plt.show()

def stacked_bar_col_7():
    
    ######## READ CSV ########
    colnum = 7
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########
    cats = {"BAD ERROR TRACE":{}, 

                "INTERACTIVE PROBLEMS": {},

                "CPP":{},

                "NO TEMPLATES": {},
                'not ux friendly':{},
                'correct code wrong output':{},
                'in queue':{}
                }

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    for key in categories.keys():
        if key in ('poor error explaination', 'runtime error', 'error not shown', 'confused mle for runtime error', 'variable out of scope',"correct code wrong answer"):
            cats['BAD ERROR TRACE'][key] = categories[key]
        elif key in ('interactive problems', 'idleness error'):
            cats['INTERACTIVE PROBLEMS'][key] = categories[key]
        elif key in ('importing libs', 'input format'):
            cats['NO TEMPLATES'][key] = categories[key]
        elif key in ('sigsegv', 'cpp' ):
            cats['CPP'][key] = categories[key]
        
        elif key != 'nan':
            cats[key][key] = categories[key] 

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])
    plt.tight_layout()
    plt.show()

def stacked_bar_col_8():
    
    ######## READ CSV ########
    colnum = 8
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    cats = {"DEBUGGING":{},
            "POOR EDITOR":{},            
            "TESTCASES":{},
            "premium version":{}
            }
    for key in categories.keys():
        if key in ('logical errors', 'poor error explaination', 'tracing root cause','no debugger', 'some issues during debugging', 'sigsegv', 'error not shown', 'wrong variable names', 'data type error', 'mixing loops'):
            cats['DEBUGGING'][key] = categories[key]
        elif key in ('handling io', 'no autocomplete', 'no proper documentation', 'lacks vscode features', 'poor editor', 'differences cpp versions'):
            cats['POOR EDITOR'][key] = categories[key]
        elif key in ('all test case passes in single run', 'hidden testcases', 'edge testcases'):
            cats['TESTCASES'][key] = categories[key]
        elif key != 'nan':
            cats[key][key] = categories[key] 

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])
    plt.tight_layout()
    plt.show()

def stacked_bar_col_10():
    
    ######## READ CSV ########
    colnum = 10
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    cats = {"CODE":{},
            "SUGGESTIONS":{},            
            "TESTCASES":{},
            "no ai":{},
            "real life scenario problems":{},
            "saves time":{}
            }
    for key in categories.keys():
        if key in ('code boilerplate', 'code logic', 'code completion', 'correct data structure and predefined functions', 'syntax analysis'):
            cats['CODE'][key] = categories[key]
        elif key in ('better suggestions', 'shaping out ideas', 'optimisation', 'debugging', 'clarifying problem statements', 'suggest algorithms', 'post-contest learning','hints', 'error explaination'):
            cats['SUGGESTIONS'][key] = categories[key]
        elif key in ('testcases', 'edge cases'):
            cats['TESTCASES'][key] = categories[key]
        elif key != 'nan':
            cats[key][key] = categories[key] 

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])
    plt.tight_layout()
    plt.show()
def stacked_bar_col_12():
    
    ######## READ CSV ########
    colnum = 12
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    cats = {"EXTERNAL HELP":{},
            "MANUAL":{},
            }
    for key in categories.keys():
        if key in ('ai','telegram','websurf','stackoverflow','friend', 'editorial','forums'):
            cats['EXTERNAL HELP'][key] = categories[key]
        elif key in ('local ide', 'manual debug','restart','templates','leave question','no ai'):
            cats['MANUAL'][key] = categories[key]
    
        elif key != 'nan':
            cats[key] = {}
            cats[key][key] = categories[key] 

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])
    plt.tight_layout()
    plt.show()

def stacked_bar_col_13():
    
    ######## READ CSV ########
    colnum = 13
    csv = "NON_NUMERIC_CLEAN.csv"
    df = pd.read_csv(csv)
    question = df.iloc[:,colnum]


    ######## EXTRACT CATEGORIES ########

    categories = {}
    
    for q in question:
        cats = str(q).split(";")
        cats = [c.strip().lower() if c.strip().lower() != '' else 'nan' for c in cats]
        
        for c in cats:
            if c not in categories.keys():
                categories[c] = 0
            categories[c] += 1

    ######## MAP CATEGORIES ########
    cats = {"OPTIMIZER":{},
            "TESTCASES":{},
            "ASSISTANCE":{},
            "BETTER EDITOR":{},
            "VISUALISE":{}
            }
    for key in categories.keys():
        if key in ('code optimizer'):
            cats['OPTIMIZER'][key] = categories[key]
        elif key in ('smart testcase generator','better test codeforces'):
            cats['TESTCASES'][key] = categories[key]
        elif key in ('hints','guide from wrong to right solution','better question description','predict complexities','failure explainer','i/o formatting','suggestions','generate more problems'):
            cats['ASSISTANCE'][key] = categories[key]
        elif key in ('android based','ai','debugger','autocomplete','terminal','shortcuts','interactive ide','simple ui', 'language translation'):
            cats['BETTER EDITOR'][key] = categories[key]
        elif key in ('visualise solution','highlight error','visualise code'):
            cats['VISUALISE'][key] = categories[key]
        elif key != 'nan':
            cats[key] = {}
            cats[key][key] = categories[key] 

    ######## PLOT ########

    df = pd.DataFrame(cats).T.fillna(0)
    ax = df.plot(kind='barh', stacked=True, figsize=(10, 6), colormap='viridis')
    [ax.bar_label(c, label_type='center', color='white', fontweight='bold') for c in ax.containers]
    ax.bar_label(ax.containers[-1], labels=[f'{int(x)}' for x in df.sum(axis=1)], padding=3)
    
    plt.legend(title='Sub-categories', bbox_to_anchor=(1.05, 1), loc='upper left', borderaxespad=0.)
    plt.title("Q.25 One feature users like to add", pad=20)
    plt.yticks(range(len(df)), [k[:20]+'...' if len(k)>20 else k for k in df.index])

    plt.tight_layout()
    plt.show()


def main():

    # preprocess("NON_NUMERIC_CLEAN.csv",colnum = 12)
    # preprocess("NON_NUMERIC_CLEAN.csv",colnum = 13)


    # visualise("NON_NUMERIC_CLEAN.csv",colnum=6)
    # stacked_bar_col_6()

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=7)
    # stacked_bar_col_7()

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=8)
    # stacked_bar_col_8()
    # visualise("NON_NUMERIC_CLEAN.csv",colnum=9)

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=10)
    # stacked_bar_col_10()
    # visualise("NON_NUMERIC_CLEAN.csv",colnum=11)

    # visualise("NON_NUMERIC_CLEAN.csv",colnum=12)
    # stacked_bar_col_12()
    visualise("NON_NUMERIC_CLEAN.csv",colnum=13)
    stacked_bar_col_13()

if __name__ == "__main__":
    main()