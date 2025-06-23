#include <windows.h>

int main()
{
    ShellExecuteA(NULL, "open", "https://google.com", NULL, NULL, SW_SHOWNORMAL);
    return 0;
}
