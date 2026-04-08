#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> leftRotate(vector<int>& arr, int k) {
        vector<vector<int>> matrix(3,vector<int>(3,0));
        for(int i=0;i<arr.size();i++){
            arr[i] = k;
        }
    
        return arr;
    }
};

int main() {
    int t;
    if (!(std::cin >> t)) return 0;
    Solution sol;
    while (t--) {
        int n;
        std::cin >> n;
        std::vector<int> arr(n);
        for(int i=0; i<n; i++) std::cin >> arr[i];
        int k;
        std::cin >> k;
        std::vector<int> res = sol.leftRotate(arr, k);
        std::cout << "[";
        for(size_t i=0; i<res.size(); i++) {
            std::cout << res[i] << (i < res.size()-1 ? "," : "");
        }
        std::cout << "]\n";
    }
    return 0;
}
#include <cstdio>
static struct _DAP_StdinRedirector { _DAP_StdinRedirector() { freopen("input.txt", "r", stdin); } } _dap_stdin_redirector;
