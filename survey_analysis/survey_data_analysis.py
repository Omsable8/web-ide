import pandas as pd
import seaborn as sb
import numpy as np

def split_cat_num():

    df = pd.read_excel("Survey data.xlsx")


    print(f"SUMMARY OF DF: {df.describe()}")
    print(f"INFO OF DF:\n {df.info()}")

    COLUMNS = df.columns
    # print(f"COLUMNS: \n{COLUMNS}")

    df_numeric = df.select_dtypes(include=np.number)
    df_non_numeric = df.select_dtypes(exclude=np.number)

    categorical_cols = df_numeric.columns
    numeric_cols = df_non_numeric.columns

    print(f"{len(categorical_cols)} CAT COLUMNS: \n{categorical_cols}")
    print(f"{len(numeric_cols)} NUMERIC COLUMNS: \n{numeric_cols}")


    df_numeric.to_csv("SURVEY_NUMERIC_DATA.csv",index=False)
    df_non_numeric.to_csv("SURVEY_NON_NUMERIC_DATA.csv",index=False)

def analyse_num():
    df = pd.read_csv("SURVEY_NUMERIC_DATA.csv")
    # print(df.info())
    print(df[df.columns[8]])
    
def analyse_non():
    '''
    # almost 7 questions of demograph - Who, institute, experience, platform, main platform, platform rank, contest participation
    # 4 Pain points in IDE -  challenges with example, debugging, why migrate
    # AICA - 2 questions
    # 2 solutions - in use , and which can be added in future
    # '''

    df = pd.read_csv("SURVEY_NON_NUMERIC_DATA.csv")

    # print("BEFORE CLEANING: ")
    # df.info()

    ''' PAIN POINTS IN IDE'''
    print("\t\t\t\tPAIN POINTS IN CP IDE\n")
    ############# cleaing challenges col ###############

    challenges = df.iloc[:,6]
    uniques = challenges.unique()
    nulls = set(["Not as such", "Not much issue"])
    for uq in uniques:
        if len(str(uq)) < 10:
            nulls.add(uq)

    nulls.remove(np.nan)
    print("Null values to remove from CHALLENGES: ",nulls)
    df.iloc[:,6] = df.iloc[:,6].replace(to_replace=nulls,value=np.nan)
    
    print(df.iloc[:,6].describe())
    print("\n\n")
    ########### cleaning  examlpes col ##########
    examples = df.iloc[:,7]
    nulls = set(["dont remember"])
    for ex in examples.unique():
        e = str(ex).strip().lower()
        if len(e) < 5:
            nulls.add(ex)
    
    nulls.remove(np.nan)
    print("NULLS VALUES IN EXAMPLES: ",nulls)
    df.iloc[:,7] = df.iloc[:,7].replace(to_replace=nulls,value=np.nan)
    print(df.iloc[:,7].describe())

    print("\n\n")
    ########### filling nan values debgging challenges col ############
    nulls = set(['.','-'])
    df.iloc[:,8] = df.iloc[:,8].replace(to_replace=nulls,value=np.nan)
    print("NULL VALUES IN DEBUGGING CHALLENGES: ",nulls)
    print(df.iloc[:,8].describe())

    print("\n\n")
    ########### Cleaning migrate col ###########
    #### Seperate by semi-colons to categorize
    nulls = set()
    migrate = df.iloc[:,9]
    print("NULL VALUES IN MIGRATION REASON: ",nulls)
    print(df.iloc[:,9].describe())

    print("\n\n")

    ''' AICA RELATED'''
    print("\t\t\t\tAICA RELATED\n")

    ############## Cleaning AICA in use col ###########
    aica = df.iloc[:,10]
    nulls = set()
    for soln in aica:
        s = str(soln).strip().lower()
        if len(s) < 9:
            nulls.add(soln)

    nulls.remove(np.nan)
    print("NULL VALUES IN AICA: ",nulls)
    df.iloc[:,10] = df.iloc[:,10].replace(to_replace=nulls,value=np.nan)

    print(df.iloc[:,10].describe())
    print("\n\n")

    ########### Cleaning concerns of AICA col #########
    ## Seperate by semi-colon
    nulls = set()
    concerns = df.iloc[:,11]
    print("NULL VALUES IN AICA CONCERNS: ",nulls)
    print(concerns.describe())
    print("\n\n")
    
    '''  Solutions '''
    print("\t\t\t\tPOSSIBLE SOLUTIONS \n")
    ########### Cleaning solutions column ##########
    solns = df.iloc[:,12]
    nulls = set()
    for soln in solns:
        s = str(soln).strip().lower()
        if len(s) < 6 and s != 'ai':
            nulls.add(soln)
    nulls.remove(np.nan)
    print("NULL VALUES IN SOLNS: ",nulls)
    df.iloc[:,12] = df.iloc[:,12].replace(to_replace=nulls,value=np.nan)

    print(df.iloc[:,12].describe())
    print("\n\n")

    ########## possible solutions ##########
    
    possible_solns = df.iloc[:,13]
    nulls = set(['Not much',"Don't know", "Nothing ig", "Not so much"] )
    for soln in possible_solns:
        s = str(soln).strip().lower()
        if len(s) < 5 and s != 'ai':
            nulls.add(soln)
    nulls.remove(np.nan)
    df.iloc[:,13] = df.iloc[:,13].replace(to_replace=nulls,value=np.nan)

    print("NULL VALUES IN possible_solns: ",nulls)

    print(df.iloc[:,13].describe())
    print("\n\n")


    ''' SAVING CLEAN DATA TO CSV '''

    # print("AFTER CLEANING: ")
    # df.info()
    print(df.iloc[:,3:5].head(10))
    

    df.to_csv("NON_NUMERIC_CLEAN.csv",index=False)
    
if __name__ == "__main__":
    # split_cat_num()
    # analyse_num()
    analyse_non()