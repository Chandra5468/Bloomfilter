class BloomFilter{
    /**
     * Initializes a new Bloom Filter.
     * @param {number} size - the size of the bit array. (m)
     * @param {number} numHashes - The number of hash functions to use. (k)
    */

    constructor(size, numHashes){
        this.size = size;
        this.numHashes = numHashes;
        this.bitArray = new Array(size).fill(0); // Initialize all bits to 0
    }

    /**
     * Simple hash function to generate multiple indices
     * Basic string hashing approach (Instread of using heavy crypto based hashing packages)
     * Murmur Hash, FNV-1a, or combinations of cryptographic hashes
     * @param {string} item - The item to hash.
     * @param {number} seed - A seed to generate different hash values.
     * @returns {number} The hash index.
     */

    _hash(item, seed){
        let hash = 0;
        for(let i=0; i< item.length; i++){
            const char = item.charCodeAt(i); // gives unicode value of each character
            hash = (hash << 5) - hash + char; // string hashing (shifting bits to left and subtracting + adding charcode)
            hash = hash & hash; // converting to 32 bit integer (bit wise and ops)
        }
        // performing xor for different hash outputs
        hash = hash ^ seed;
        let res = Math.abs(hash % this.size) // ensure positive and within bounds
        console.log("This is retuned ", res)
        return res
    }

    /**
     * Add an item to bloom filter
     * @param {string} item - The item to add.
     */

    add(item){
        for(let i =0; i< this.numHashes; i++){
            const index = this._hash(item, i); // using i as seed for different hashes
            this.bitArray[index] = 1;
        }
    }

    /**
     * Checks if an item is possibly in the Bloom filter.
     * Returns true if item is possibly in, false if definitely not.
     * @param {string} item - The item to check
     * @returns {boolean}
     */

    contains(item){
        for(let i = 0; i<this.numHashes; i++){
            const index = this._hash(item, i);
            if(this.bitArray[index] === 0){
                return false; // Found a 0 bit, definitely not in the set
            }
        }

        return true // all bits are 1. So, possibly in the set
    }
}

// --- Test Cases ---

console.log("--- Node.js Bloom Filter Test Cases ---");

// Test Case 1: Basic functionality with strings
console.log("\n--- Test Case 1: Basic String Operations ---");
const bf1 = new BloomFilter(100, 3); // Size 100, 3 hash functions

bf1.add("apple");
bf1.add("banana");
bf1.add("cherry");

console.log("Contains 'apple':", bf1.contains("apple"));     // Expected: true
console.log("Contains 'banana':", bf1.contains("banana"));   // Expected: true
console.log("Contains 'cherry':", bf1.contains("cherry"));   // Expected: true
console.log("Contains 'grape':", bf1.contains("grape"));     // Expected: false (should be)
console.log("Contains 'orange':", bf1.contains("orange"));   // Expected: false (should be)


// Test Case 2: Numbers (converted to string)
console.log("\n--- Test Case 2: Number Operations (as strings) ---");
const bf2 = new BloomFilter(200, 4);
for (let i = 0; i < 50; i++) {
    bf2.add(i.toString()); // Add numbers 0-49
}

console.log("Contains '25':", bf2.contains("25"));         // Expected: true
console.log("Contains '0':", bf2.contains("0"));           // Expected: true
console.log("Contains '49':", bf2.contains("49"));         // Expected: true
console.log("Contains '50':", bf2.contains("50"));         // Expected: false (should be)
console.log("Contains '100':", bf2.contains("100"));       // Expected: false (should be)


// Test Case 3: Observing a potential false positive
// A smaller filter size and more elements increase false positive probability.
console.log("\n--- Test Case 3: Observing Potential False Positives ---");
const bf3 = new BloomFilter(50, 2); // Small filter, few hashes
const addedWords = ["cat", "dog", "bird", "fish", "lion"];
addedWords.forEach(word => bf3.add(word));

console.log("Words added:", addedWords.join(", "));
console.log("Contains 'cat':", bf3.contains("cat"));
console.log("Contains 'tiger':", bf3.contains("tiger")); // Should be false, but might be true (false positive)
console.log("Contains 'zebra':", bf3.contains("zebra")); // Should be false
console.log("Contains 'elephant':", bf3.contains("elephant")); // Should be false


// Test Case 4: Larger scale test to see false positive rate
console.log("\n--- Test Case 4: Larger Scale Test & False Positive Rate (Approximate) ---");
const numElements = 1000;
const filterSize = 10000; // m
const numHashes = 7;      // k (optimal for this size and elements often around ln(2) * m/n)

const bf4 = new BloomFilter(filterSize, numHashes);
const addedItems = new Set(); // To keep track of truly added items
const checkedNonItems = [];   // To check against (should not be in filter)
let falsePositives = 0;

// Add elements
for (let i = 0; i < numElements; i++) {
    const item = `item_${i}`;
    bf4.add(item);
    addedItems.add(item);
}

// Generate some items that were NOT added
for (let i = numElements; i < numElements + 500; i++) { // Check 500 non-existent items
    checkedNonItems.push(`item_${i}`);
}

// Check for false positives
checkedNonItems.forEach(item => {
    if (bf4.contains(item)) {
        falsePositives++;
    }
});

console.log(`Filter Size (m): ${filterSize}`);
console.log(`Number of Hashes (k): ${numHashes}`);
console.log(`Number of items added (n): ${numElements}`);
console.log(`Number of non-existent items checked: ${checkedNonItems.length}`);
console.log(`False Positives found: ${falsePositives}`);
console.log(`False Positive Rate: ${(falsePositives / checkedNonItems.length * 100).toFixed(2)}%`);

// Theoretical false positive rate calculation (approximate)
// p = (1 - e^(-kn/m))^k
const p = Math.pow(1 - Math.exp(-(numHashes * numElements) / filterSize), numHashes);
console.log(`Theoretical False Positive Rate: ${(p * 100).toFixed(2)}%`);
