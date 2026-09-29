param(
    [Parameter(Mandatory = $true)]
    [string]$AutoJs6Apk,

    [Parameter(Mandatory = $true)]
    [string]$Mfabd2Apk
)

$ErrorActionPreference = "Stop"

$expected = @{
    AutoJs6 = "A4FA5C941AECC4DBB770316E35AC98AE5B0EFEF5041AC0533DFA826B94595525"
    MFABD2  = "8ED46AFA556AAA3721B94C73EE1901C0D42B2552DBC57C78DCCCBFE712E89787"
}

function Assert-Sha256 {
    param(
        [string]$Name,
        [string]$Path,
        [string]$Expected
    )

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        throw "$Name file not found: $Path"
    }

    $actual = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToUpperInvariant()
    if ($actual -ne $Expected) {
        throw "$Name SHA256 mismatch. expected=$Expected actual=$actual path=$Path"
    }

    Write-Host "OK $Name SHA256 $actual"
}

Assert-Sha256 -Name "AutoJs6" -Path $AutoJs6Apk -Expected $expected.AutoJs6
Assert-Sha256 -Name "MFABD2"  -Path $Mfabd2Apk -Expected $expected.MFABD2
