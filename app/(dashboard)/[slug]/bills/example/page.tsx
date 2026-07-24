"use client";

export default function ExamplePrintPage() {
  return (
    <div className="bg-gray-200 flex justify-center p-10 print:bg-white print:p-0">
      <div
  className="
    w-[80mm]
    bg-white
    p-3
    pb-[10mm]
    shadow-lg
    print:shadow-none
  "
>

        {/* Shop Details */}
        <div className="text-center">
          <h1 className="text-xl font-bold">JP Fruit Supplier</h1>

          <p>Contact : 1234567890</p>
          <p>Alt : 9876543210</p>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Customer */}

        <div>
          <span className="font-semibold">Customer :</span>{" "}
          Karan Varma
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Heading */}

        <div className="flex justify-between font-bold">
          <span>Item</span>
          <span>Total</span>
        </div>

        <div className="border-t border-dashed border-black my-2" />

        {/* Item 1 */}

        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>

          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>

          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>
          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>
          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>
          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>
          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>

          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>
        <div className="mb-3">
          <div className="font-semibold">
            Apple
          </div>

          <div className="flex justify-between">
            <span>23 × 45 × ₹12</span>
            <span>₹12,420</span>
          </div>
        </div>

        {/* Item 2 */}

        <div className="mb-3">
          <div className="font-semibold">
            Grapes
          </div>

          <div className="flex justify-between">
            <span>34 × 34 × ₹12</span>
            <span>₹13,872</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        {/* Total */}

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹26,292</span>
        </div>

        <div className="border-t border-dashed border-black my-3" />

        <div className="text-center text-sm">
          Thank You! <br />
          Visit Again
        </div>
      </div>

      
    </div>
  );
}