import { notFound } from "next/navigation";
import { BookingClient } from "@/components/booking/booking-client";
import { prisma } from "@/lib/prisma";

export default async function BookingPage({ params }: { params: { slug: string } }) {
  const organization = await prisma.organization.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      slug: true,
      primaryColor: true,
      secondaryColor: true
    }
  });

  if (!organization) {
    notFound();
  }

  return <BookingClient organization={organization} />;
}
