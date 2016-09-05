///////////////////////////////////////
////  ♪┏(°.°)┛  LEAF  ┗(°.°)┓♪ ////
///////////////////////////////////////
function Leaf(character, count) {
  this.character = character;
  this.count = count;
}


Leaf.prototype.encoderObject = function(parentBits) {
  return {[this.character]: parentBits}
}

Leaf.prototype.unsetParents = function() {
  return this;
}

/////////////////////////////
//// (>’.’)> NODE <(‘.'<) ///
/////////////////////////////
function Node(left, right) {
  this.left = left;
  this.right = right;

  Object.defineProperties(this, {
      count: {"get": function() { return this.left.count + this.right.count; }}
  });
}

Node.prototype.encoderObject = function(parentBits = "") {
  var leftEncoderObject = this.left.encoderObject(parentBits + "0");
  var rightEncoderObject = this.right.encoderObject(parentBits + "1");
  return _.extend(leftEncoderObject, rightEncoderObject);
}

Node.prototype.unsetParents = function() {
  delete this.left.unsetParents().parent;
  delete this.right.unsetParents().parent;
  return this;
}

///////////////////////////////////
//// (⌐■_■)  ENCODER  (⌐■_■) ////
//////////////////////////////////
function Encoder(message) {

  buildTree(this, message);

  var encoder = this;
  this.compressedBitstring = message.split('').reduce(function(bitstring, character){
    return bitstring + encoder.characterToCode(character);
  }, "");

  function buildTree(encoder, message) {
    var characterCounts = _.countBy(message.split(''));

    var nodeQueue = _.map(characterCounts, function(count, character) {
      return new Leaf(character, count);
    })

    encoder.leaves = nodeQueue.slice(0);

    while(nodeQueue.length > 1) {
      nodeQueue = _.sortBy(nodeQueue, 'count');
      newNode = new Node(nodeQueue.shift(), nodeQueue.shift())
      newNode.left.parent = newNode.right.parent = newNode;
      nodeQueue.push(newNode);
    }

    encoder.root = nodeQueue[0];
  }

}

Encoder.prototype.characterToCode = function(character) {
  return this.root.encoderObject()[character];
}

Encoder.prototype.decode = function(compressedBitstring) {

  return recursiveDecode.call(this, compressedBitstring, 0, this.root)
}
  
const recursiveDecode = function(bitstring, currentIndex, currentPos) {
 let result = ""

 if (currentPos instanceof Leaf) {
   result += currentPos.character  

   return result += recursiveDecode.call(this, bitstring, currentIndex, this.root)

 } else if (currentIndex === (bitstring.length)) {

   return result

 } else if (parseInt(bitstring[currentIndex]) === 1) {

   return result += recursiveDecode.call(this, bitstring, currentIndex + 1, currentPos.right)

 } else {

   return result += recursiveDecode.call(this, bitstring, currentIndex + 1, currentPos.left)
 }
}

///////////////////////////////////
//// ><((((‘> DECODER <`))))>< ////
///////////////////////////////////
function Decoder(compressedBitstring, rootNode) {
  this.bitstring = compressedBitstring;
  this.root = rootNode;
}

Decoder.prototype.message = function(){
  return recursiveDecode.call(this, this.bitstring, 0, this.root)
}
