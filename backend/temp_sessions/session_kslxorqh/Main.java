public class Main {
    public static void main(String[] args) {
        int a = 10;
        String s = "";
        for(int i=0;i<a;i++){
            if(i % 2 == 0) s+="*";
        }
        System.out.println(s);
    }
}