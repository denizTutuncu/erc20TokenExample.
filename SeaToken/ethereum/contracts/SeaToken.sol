// SPDX-License-Identifier: MIT
pragma solidity >0.4.25 <0.8.1;

contract SeaTokenSale {
    address admin;
    SeaToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event End(
        uint256 _contractBalance,
        uint256 _adminBalance
      );
    event Sell(
      address _buyer,
      uint256 _amount
      );

    constructor(SeaToken _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns(uint z) {
      require(y == 0 || (z = x * y) / y == x);
    }

    function buyTokens(uint _numberOfTokens) public payable {
      require(msg.value == multiply(_numberOfTokens, tokenPrice));
      require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
      require(tokenContract.transfer(msg.sender, _numberOfTokens));
      tokensSold += _numberOfTokens;
      emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
      require(msg.sender == admin);
      require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
      emit End(tokenContract.balanceOf(address(this)), tokenContract.balanceOf(address(admin)));
      selfdestruct(payable(admin));
    }
}

contract SeaToken {

    uint public totalSupply;
    string public name = "Sea Token";
    string public symbol = "SEA";
    string public standard = "SEA Token v1.0";

    event Transfer(
      address indexed _from,
      address indexed _to,
      uint256 _value
    );

    event Approval(
      address indexed _owner,
      address indexed _spender,
      uint256 _value
    );

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(uint _initalSupply) {
        balanceOf[msg.sender] = _initalSupply;
        totalSupply = _initalSupply;
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[msg.sender] >= _value);

      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;

      emit Transfer(msg.sender, _to, _value);
      return true;
    }

   function approve(address _spender, uint256 _value) public returns (bool success) {
       allowance[msg.sender][_spender] = _value;
       emit Approval(msg.sender, _spender, _value);
       return true;
   }

   function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      require(_value <= balanceOf[_from]);
      require(_value <= allowance[_from][msg.sender]);

      balanceOf[_from] -= _value;
      balanceOf[_to] += _value;

      allowance[_from][msg.sender] -= _value;

      emit Transfer(_from, _to, _value);
      return true;
  }
}
