import java.util.*;

class Solution {
    public int[] leftRotate(int[] arr, int k) {
        for(int i=0;i<arr.lengt;i++){
            arr[i] = k;
        }
        return new int[]{};
    }
}

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int t = sc.nextInt();
        Solution sol = new Solution();
        for (int i = 0; i < t; i++) {
            try {
                int n = sc.nextInt();
                int[] arr = new int[n];
                for(int j=0; j<n; j++) arr[j] = sc.nextInt();
                int k = sc.nextInt();
                
                int[] res = sol.leftRotate(arr, k);
                System.out.println(Arrays.toString(res).replaceAll(" ", ""));
            } catch (Exception e) {
                System.out.println("null");
            }
        }
    }
}